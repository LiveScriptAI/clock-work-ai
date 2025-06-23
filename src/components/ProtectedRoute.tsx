
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!user) {
        navigate("/register");
        return;
      }

      try {
        // Check user's subscription status
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("subscription_status")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
          navigate("/payment");
          return;
        }

        const isActive = profile?.subscription_status === 'active';
        setHasActiveSubscription(isActive);

        if (!isActive) {
          navigate("/payment");
        }
      } catch (error) {
        console.error("Subscription check error:", error);
        navigate("/payment");
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    checkSubscriptionStatus();
  }, [user, navigate]);

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (isCheckingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};

export default ProtectedRoute;
