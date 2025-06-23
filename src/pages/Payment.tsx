
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const PaymentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/register");
      return;
    }
  }, [user, navigate]);

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please log in first");
      navigate("/register");
      return;
    }

    setIsLoading(true);
    
    try {
      // Call our edge function to create a checkout session
      const response = await fetch('/functions/v1/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          userId: user.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-6 font-body">
      <div className="flex flex-col items-center max-w-md w-full">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/lovable-uploads/5e5ad164-5fad-4fa8-8d19-cbccf2382c0e.png" 
            alt="Clock Work Pal logo" 
            className="w-56 h-auto mx-auto"
          />
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl font-display text-brand-navy">Complete Your Subscription</CardTitle>
          </CardHeader>
          <CardContent className="pb-6 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-brand-navy mb-2">£3.99/month</h2>
              <p className="text-gray-600 mb-6">Get full access to Clock Work Pal</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700">Track your work shifts</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700">Manage break times</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700">Generate timesheets & invoices</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700">Digital signatures</span>
              </div>
            </div>

            <Button 
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full bg-brand-accent text-brand-navy font-semibold rounded-full shadow-lg hover:opacity-90 transition font-body"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Subscribe Now - £3.99/month"
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Secure payment powered by Stripe. Cancel anytime.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
