
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Initialize Supabase with service role key for writes
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Webhook verified", { type: event.type });

    switch (event.type) {
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        logStep("Processing payment succeeded", { customerId });
        
        await supabaseClient
          .from("profiles")
          .update({ subscription_status: "active" })
          .eq("stripe_customer_id", customerId);
        
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        logStep("Processing payment failed", { customerId });
        
        await supabaseClient
          .from("profiles")
          .update({ subscription_status: "past_due" })
          .eq("stripe_customer_id", customerId);
        
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        logStep("Processing subscription deleted", { customerId });
        
        await supabaseClient
          .from("profiles")
          .update({ 
            subscription_status: "canceled",
            stripe_subscription_id: null,
            subscription_tier: null
          })
          .eq("stripe_customer_id", customerId);
        
        break;
      }

      default:
        logStep("Ignoring event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
