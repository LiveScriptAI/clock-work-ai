
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

    const { session_id } = await req.json();
    if (!session_id) {
      logStep("ERROR: No session_id provided");
      throw new Error("No session_id provided");
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      logStep("ERROR: STRIPE_SECRET_KEY is not set");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    logStep("Session ID received", { session_id });

    // Create Supabase client with service role for database updates
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    logStep("Retrieved checkout session", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      customerId: session.customer,
      metadata: session.metadata
    });

    if (session.payment_status !== "paid") {
      logStep("ERROR: Payment not completed", { paymentStatus: session.payment_status });
      throw new Error("Payment not completed");
    }

    // Get customer and subscription details
    const customerId = session.customer as string;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      logStep("ERROR: No active subscription found");
      throw new Error("No active subscription found");
    }

    const subscription = subscriptions.data[0];
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    
    logStep("Found active subscription", {
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: subscriptionEnd
    });

    // Get customer details
    const customer = await stripe.customers.retrieve(customerId);
    const customerEmail = (customer as any).email;
    const userId = session.metadata?.user_id;

    if (!customerEmail) {
      logStep("ERROR: Customer email not found");
      throw new Error("Customer email not found");
    }

    if (!userId) {
      logStep("ERROR: User ID not found in session metadata");
      throw new Error("User ID not found in session metadata");
    }

    logStep("Customer details verified", { email: customerEmail, userId });

    // Update user profile in Supabase
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        subscription_status: "active",
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        subscription_tier: "premium",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      logStep("ERROR: Failed to update profile", { error: updateError });
      throw new Error(`Failed to update user profile: ${updateError.message}`);
    }

    logStep("Successfully updated user profile", { userId, email: customerEmail });

    return new Response(JSON.stringify({ 
      success: true, 
      subscription_status: "active",
      subscription_id: subscription.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-checkout-session", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
