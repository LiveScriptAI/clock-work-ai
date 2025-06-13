
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Initialize Supabase with service role key for writes
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("sessionId is required");
    logStep("Session ID received", { sessionId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve the checkout session with expanded subscription and customer
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });

    if (!session.subscription) {
      throw new Error("No subscription found in session");
    }

    const subscription = session.subscription as Stripe.Subscription;
    const customer = session.customer as Stripe.Customer;
    const userId = session.metadata?.supabaseUserId;

    if (!userId) {
      throw new Error("No user ID found in session metadata");
    }

    logStep("Session retrieved", { 
      subscriptionId: subscription.id, 
      userId, 
      status: subscription.status,
      customerEmail: customer.email 
    });

    // Determine subscription tier based on price
    let subscriptionTier = "basic";
    if (subscription.items.data.length > 0) {
      const price = subscription.items.data[0].price;
      const amount = price.unit_amount || 0;
      if (amount >= 2500) { // £25 or more
        subscriptionTier = "pro";
      }
    }

    // Update user's subscription status in profiles table
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_tier: subscriptionTier
      })
      .eq("id", userId);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    logStep("Profile updated successfully", { 
      subscriptionId: subscription.id, 
      status: subscription.status,
      tier: subscriptionTier
    });

    // Also update or create entry in subscribers table for additional tracking
    const { error: subscriberError } = await supabaseClient
      .from("subscribers")
      .upsert({
        user_id: userId,
        email: customer.email || '',
        stripe_customer_id: customer.id,
        subscribed: subscription.status === 'active',
        subscription_tier: subscriptionTier,
        subscription_end: subscription.current_period_end ? 
          new Date(subscription.current_period_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (subscriberError) {
      logStep("Warning: Failed to update subscribers table", { error: subscriberError.message });
    } else {
      logStep("Subscribers table updated successfully");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
