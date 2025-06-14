
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please sign in to start your trial");
      return;
    }

    setLoading(true);
    try {
      console.log('Starting checkout for user:', user.email);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session');

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Checkout session created, redirecting to:', data.url);
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error starting checkout. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('STRIPE_SECRET_KEY')) {
          errorMessage = 'Stripe configuration error. Please contact support.';
        } else if (error.message.includes('STRIPE_PRICE_ID')) {
          errorMessage = 'Pricing configuration error. Please contact support.';
        } else if (error.message.includes('Authentication')) {
          errorMessage = 'Please sign in again and try again.';
        }
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
