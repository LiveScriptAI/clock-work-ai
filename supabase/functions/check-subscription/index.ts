
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Developer emails that should have full access
const DEVELOPER_EMAILS = ['dytransport20@gmail.com'];

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY is not set");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key verified");

    // Initialize Supabase with service role key for writes
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header provided");
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("ERROR: Authentication failed", { error: userError.message });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.id || !user?.email) {
      logStep("ERROR: User not authenticated or missing email");
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user is a developer
    if (DEVELOPER_EMAILS.includes(user.email)) {
      logStep("Developer access granted", { email: user.email });
      
      // Update profile with developer access
      await supabaseClient
        .from("profiles")
        .update({ 
          subscription_status: 'active',
          subscription_tier: 'pro'
        })
        .eq("id", user.id);

      return new Response(JSON.stringify({
        subscribed: true,
        subscription_tier: 'pro',
        subscription_status: 'active'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if user already has a Stripe customer ID in profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("stripe_customer_id, subscription_status, subscription_tier")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      logStep("ERROR: Failed to fetch user profile", { error: profileError.message });
      throw new Error(`Failed to fetch user profile: ${profileError.message}`);
    }

    let customerId = profile?.stripe_customer_id;

    // If no customer ID in profile, check Stripe by email
    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing Stripe customer by email", { customerId });
        
        // Update profile with customer ID
        await supabaseClient
          .from("profiles")
          .update({ stripe_customer_id: customerId })
          .eq("id", user.id);
      }
    }

    if (!customerId) {
      logStep("No customer found, user not subscribed");
      // Update profile to reflect no subscription
      await supabaseClient
        .from("profiles")
        .update({ 
          subscription_status: null,
          subscription_tier: null
        })
        .eq("id", user.id);
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: null,
        subscription_status: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Checking subscriptions for customer", { customerId });

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionStatus = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionStatus = subscription.status;
      
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        status: subscriptionStatus 
      });

      // Determine subscription tier from price
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      if (amount <= 999) {
        subscriptionTier = "basic";
      } else if (amount <= 1999) {
        subscriptionTier = "pro";
      } else {
        subscriptionTier = "enterprise";
      }
      
      logStep("Determined subscription tier", { priceId, amount, subscriptionTier });
    } else {
      logStep("No active subscription found");
    }

    // Update profile with latest subscription info
    await supabaseClient
      .from("profiles")
      .update({ 
        subscription_status: subscriptionStatus,
        subscription_tier: subscriptionTier
      })
      .eq("id", user.id);

    logStep("Updated profile with subscription info", { 
      subscribed: hasActiveSub, 
      subscriptionTier,
      subscriptionStatus 
    });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_status: subscriptionStatus
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      subscribed: false,
      subscription_tier: null,
      subscription_status: null
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
