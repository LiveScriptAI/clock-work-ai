
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
    console.log("🚀 Checkout button clicked", { user: !!user, isSubscribed, authLoading });
    
    if (!user) {
      console.log("📝 No user found, redirecting to register");
      navigate("/register");
      return;
    }

    if (isSubscribed) {
      console.log("✅ User already subscribed, redirecting to billing");
      navigate("/billing");
      return;
    }

    setIsProcessing(true);
    console.log("⏳ Starting checkout process...");
    
    try {
      const payload = priceId ? { priceId } : {};
      console.log("📦 Checkout payload:", payload);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      console.log("📊 Checkout response:", { data, error });
      
      if (error) {
        console.error("❌ Checkout error:", error);
        toast.error("Failed to start checkout. Please try again.");
        setIsProcessing(false);
        return;
      }
      
      if (data?.error) {
        console.error("❌ Server error:", data.error);
        if (data.redirect) {
          console.log("🔄 Redirecting to:", data.redirect);
          navigate(data.redirect);
        } else {
          toast.error(data.error);
        }
        setIsProcessing(false);
        return;
      }
      
      if (data?.url) {
        console.log("🔗 Redirecting to Stripe checkout (same tab):", data.url);
        // Use same tab redirect instead of new tab
        window.location.href = data.url;
        // Don't reset loading state since we're redirecting
        return;
      } else {
        console.error("❌ No checkout URL received:", data);
        toast.error("Failed to create checkout session. Please try again.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("💥 Unexpected checkout error:", error);
      toast.error("An unexpected error occurred. Please try again.");
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
