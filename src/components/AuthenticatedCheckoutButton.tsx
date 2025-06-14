
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthenticatedCheckoutButtonProps {
  className?: string;
  size?: "sm" | "default" | "lg";
  priceId?: string;
}

export function AuthenticatedCheckoutButton({ 
  className = "", 
  size = "lg",
  priceId 
}: AuthenticatedCheckoutButtonProps) {
  const { user, isSubscribed, isLoading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      navigate("/register");
      return;
    }

    if (isSubscribed) {
      navigate("/billing");
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log("Starting checkout for user:", user.email);
      
      const payload = priceId ? { priceId } : {};
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (error) {
        console.error("Checkout error:", error);
        toast.error("Failed to start checkout. Please try again.");
        return;
      }
      
      if (data?.error) {
        console.error("Server error:", data.error);
        if (data.redirect) {
          navigate(data.redirect);
        } else {
          toast.error(data.error);
        }
        return;
      }
      
      if (data?.url) {
        console.log("Redirecting to Stripe checkout:", data.url);
        window.open(data.url, '_blank');
        
        // Show helpful message
        toast.success("Checkout opened in new tab. Complete your subscription there!", {
          duration: 5000
        });
      } else {
        console.error("No checkout URL received:", data);
        toast.error("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected checkout error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getButtonText = () => {
    if (authLoading) return "Loading...";
    if (!user) return "Create Account";
    if (isSubscribed) return "Manage Subscription";
    return "Start Your 7-Day Free Trial";
  };

  const getButtonIcon = () => {
    if (authLoading || isProcessing) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    return <ArrowRight className="w-4 h-4" />;
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={authLoading || isProcessing}
      size={size}
      className={`bg-brand-accent text-brand-navy font-bold rounded-full shadow-xl hover:opacity-90 transition hover:scale-105 transform duration-200 ${className}`}
    >
      {getButtonText()}
      {getButtonIcon()}
    </Button>
  );
}
