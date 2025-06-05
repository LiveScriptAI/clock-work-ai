
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:3000";
    
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

    const { priceId } = await req.json();
    if (!priceId) {
      logStep("ERROR: priceId is required");
      throw new Error("priceId is required");
    }
    logStep("Price ID received", { priceId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if user already has a Stripe customer ID
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      logStep("ERROR: Failed to fetch user profile", { error: profileError.message });
      throw new Error(`Failed to fetch user profile: ${profileError.message}`);
    }

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabaseUserId: user.id
          }
        });
        customerId = customer.id;
        logStep("Created new Stripe customer", { customerId });

        // Store customer ID in profiles table
        const { error: updateError } = await supabaseClient
          .from("profiles")
          .update({ stripe_customer_id: customerId })
          .eq("id", user.id);
        
        if (updateError) {
          logStep("WARNING: Failed to update profile with customer ID", { error: updateError.message });
          // Continue with checkout even if profile update fails
        } else {
          logStep("Updated profile with customer ID");
        }
      } catch (error) {
        logStep("ERROR: Failed to create Stripe customer", { error: error.message });
        throw new Error(`Failed to create Stripe customer: ${error.message}`);
      }
    } else {
      logStep("Using existing customer ID", { customerId });
    }

    // Get price details for metadata
    let priceAmount = 0;
    try {
      const price = await stripe.prices.retrieve(priceId);
      priceAmount = price.unit_amount || 0;
      logStep("Retrieved price details", { priceId, amount: priceAmount });
    } catch (error) {
      logStep("WARNING: Could not retrieve price details", { error: error.message });
    }

    // Create checkout session with enhanced configuration
    const sessionConfig = {
      mode: "subscription" as const,
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${frontendUrl}/billing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: "required" as const,
      customer_update: {
        address: "auto" as const,
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          supabaseUserId: user.id,
          userEmail: user.email
        }
      },
      invoice_creation: {
        enabled: true,
      },
      metadata: {
        supabaseUserId: user.id,
        userEmail: user.email,
        priceId: priceId,
        priceAmount: priceAmount.toString()
      }
    };

    logStep("Creating checkout session with config", { 
      customerId, 
      priceId, 
      trialDays: 7,
      successUrl: sessionConfig.success_url,
      cancelUrl: sessionConfig.cancel_url
    });

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created successfully", { 
      sessionId: session.id, 
      url: session.url,
      customerId: session.customer
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout-session", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Please check the function logs for more information"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
