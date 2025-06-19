
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
  const { user, isEmailVerified } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleClick = async () => {
    if (!user) {
      navigate("/register");
      return;
    }

    if (!isEmailVerified) {
      toast.error("Please verify your email address before subscribing.");
      navigate("/dashboard"); // Redirect where your logic now handles verification
      return;
    }

    setIsProcessing(true);

    try {
      localStorage.setItem("checkout_in_progress", "true");

      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(priceId ? { priceId } : {}),
      });

      if (error || !data?.url) {
        toast.error("Checkout failed. Please try again.");
        localStorage.removeItem("checkout_in_progress");
        setIsProcessing(false);
        return;
      }

      const win = window.open(data.url, "_blank");
      if (!win) {
        toast.error("Popup blocked. Please allow popups and try again.");
        localStorage.removeItem("checkout_in_progress");
      }
    } catch (e) {
      toast.error("Unexpected error during checkout.");
    } finally {
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
