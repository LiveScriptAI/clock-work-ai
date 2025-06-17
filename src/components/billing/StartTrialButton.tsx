
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StartTrialButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isEmailVerified } = useAuth();

  const handleStartTrial = async () => {
    console.log("Starting trial process...");

    // Check if user is logged in
    if (!user) {
      console.log("User not logged in, redirecting to register");
      navigate("/register");
      return;
    }

    // Check if user's email is verified
    if (!isEmailVerified) {
      console.log("User email not verified, redirecting to verification");
      navigate("/email-verification");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Invoking create-checkout-session edge function...");
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session');

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Failed to start trial. Please try again.");
        return;
      }

      if (data?.url) {
        console.log("Received checkout URL, opening in new tab:", data.url);
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        console.error("No URL received from edge function");
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleStartTrial}
      disabled={isLoading}
      className="w-full h-14 text-lg font-semibold bg-hero-gradient hover:opacity-90 transition-opacity rounded-xl shadow-lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Starting Trial...
        </>
      ) : (
        "Start Free Trial"
      )}
    </Button>
  );
};

export default StartTrialButton;
