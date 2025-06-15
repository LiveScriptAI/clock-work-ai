import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user, isSubscribed, isLoading: authLoading, isEmailVerified } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const logStep = (step: string, details?: any) => {
    console.log(`[CHECKOUT] ${step}`, details ? details : '');
  };

  const handleCheckout = async () => {
    logStep('Checkout button clicked', { 
      hasUser: !!user, 
      isSubscribed, 
      isEmailVerified,
      authLoading 
    });
    
    if (!user) {
      logStep('No user found, redirecting to register');
      navigate("/register");
      return;
    }

    if (!isEmailVerified) {
      logStep('Email not verified, showing verification reminder');
      toast.error("Please verify your email address before subscribing. Check your inbox for the verification link.");
      navigate("/email-verification");
      return;
    }

    if (isSubscribed) {
      logStep('User already subscribed, redirecting to billing');
      navigate("/billing");
      return;
    }

    setIsProcessing(true);
    logStep('Starting checkout process...');
    
    try {
      // Store checkout state in localStorage for recovery
      localStorage.setItem('checkout_in_progress', 'true');
      localStorage.setItem('checkout_timestamp', Date.now().toString());
      
      const payload = priceId ? { priceId } : {};
      logStep('Checkout payload:', payload);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      logStep('Checkout response:', { data, error });
      
      if (error) {
        console.error("Checkout error:", error);
        toast.error("Failed to start checkout. Please try again.");
        localStorage.removeItem("checkout_in_progress");
        setIsProcessing(false);
        return;
      }
      
      if (data?.error) {
        console.error("Server error:", data.error);
        if (data.redirect) {
          logStep('Redirecting to:', data.redirect);
          navigate(data.redirect);
        } else {
          toast.error(data.error);
        }
        localStorage.removeItem("checkout_in_progress");
        setIsProcessing(false);
        return;
      }
      
      if (data?.url) {
        logStep('Opening Stripe checkout in new tab:', data.url);
        // Open checkout in a new tab
        const checkoutWindow = window.open(data.url, "_blank");
        if (!checkoutWindow) {
          // Popup blocked
          toast.error("Unable to open checkout. Please allow popups and try again.");
          localStorage.removeItem("checkout_in_progress");
          setIsProcessing(false);
          return;
        }
        
        // Reset processing state since checkout opened successfully
        setIsProcessing(false);
      } else {
        console.error("No checkout URL received:", data);
        toast.error("Failed to create checkout session. Please try again.");
        localStorage.removeItem("checkout_in_progress");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Unexpected checkout error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      localStorage.removeItem("checkout_in_progress");
      setIsProcessing(false);
    }
  };

  const getButtonText = () => {
    if (authLoading) return "Loading...";
    if (!user) return "Create Account";
    if (!isEmailVerified) return "Verify Email First";
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
