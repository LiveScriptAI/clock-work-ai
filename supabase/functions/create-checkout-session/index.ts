
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
    
    // Get frontend URL with fallback logic
    let frontendUrl = Deno.env.get("FRONTEND_URL");
    if (!frontendUrl) {
      // Fallback to request origin
      frontendUrl = req.headers.get("origin") || "https://preview--clock-work-ai.lovable.app";
    }
    
    // Ensure no trailing slash
    frontendUrl = frontendUrl.replace(/\/$/, '');
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified", { frontendUrl });

    // Initialize Supabase with service role key for writes
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { priceId } = await req.json();
    if (!priceId) throw new Error("priceId is required");
    logStep("Price ID received", { priceId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabaseUserId: user.id
        }
      });
      customerId = customer.id;
      logStep("Created new Stripe customer", { customerId });

      // Store customer ID in profiles table
      await supabaseClient
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
      logStep("Updated profile with customer ID");
    } else {
      logStep("Using existing customer ID", { customerId });
    }

    // Create success and cancel URLs
    const successUrl = `${frontendUrl}/billing?session_id={CHECKOUT_SESSION_ID}&payment_status=success`;
    const cancelUrl = `${frontendUrl}/billing?canceled=true&payment_status=canceled`;
    
    logStep("URLs configured", { successUrl, cancelUrl });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card", "apple_pay", "google_pay"],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          supabaseUserId: user.id
        }
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        supabaseUserId: user.id
      },
      // Add billing address collection for better completion tracking
      billing_address_collection: "auto",
      // Allow promotion codes
      allow_promotion_codes: true,
      // Collect customer information
      customer_update: {
        address: "auto",
        name: "auto"
      },
      // Configure automatic tax
      automatic_tax: {
        enabled: true,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout-session", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
