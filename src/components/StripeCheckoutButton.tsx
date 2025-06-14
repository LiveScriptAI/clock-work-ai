
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
// Removed useAuth import
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StripeCheckoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

const StripeCheckoutButton: React.FC<StripeCheckoutButtonProps> = ({ 
  className = "", 
  children = "Start 7-Day Trial - £3.99/month" 
}) => {
  const [loading, setLoading] = useState(false);
  // Removed user from useAuth()

  const handleCheckout = async () => {
    // Removed user check
    // if (!user) {
    //   toast.error("Please sign in to start your trial");
    //   return;
    // }

    setLoading(true);
    try {
      console.log('Starting checkout'); // Removed user.email logging
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session');

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Checkout session created, redirecting to:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      let errorMessage = 'Error starting checkout. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('STRIPE_SECRET_KEY')) {
          errorMessage = 'Stripe configuration error. Please contact support.';
        } else if (error.message.includes('STRIPE_PRICE_ID')) {
          errorMessage = 'Pricing configuration error. Please contact support.';
        }
        // Removed Authentication error message as user context is gone
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={loading}
      className={`relative ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </Button>
  );
};

export default StripeCheckoutButton;
