
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CheckoutButtonProps {
  className?: string;
  size?: "sm" | "default" | "lg";
  priceId?: string;
}

export function CheckoutButton({ className = "", size = "lg", priceId }: CheckoutButtonProps) {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleClick = async () => {
    if (!user) {
      navigate("/register");
      return;
    }

    setIsProcessing(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Please log in to continue.");
        navigate("/login");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify(priceId ? { priceId } : {}),
      });

      if (error || !data?.url) {
        toast.error("Checkout failed. Please try again.");
        setIsProcessing(false);
        return;
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (e) {
      toast.error("Unexpected error during checkout.");
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isProcessing}
      size={size}
      className={`bg-brand-accent text-brand-navy font-bold rounded-full shadow-xl hover:opacity-90 transition hover:scale-105 ${className}`}
    >
      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
      <span className="ml-2">Start 7-Day Free Trial</span>
    </Button>
  );
}
