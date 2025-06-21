
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isInitialized, isLoading, user } = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setIsCheckingSubscription(false);
        return;
      }

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          setHasActiveSubscription(false);
          setIsCheckingSubscription(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke("check-subscription", {
          headers: {
            "Authorization": `Bearer ${sessionData.session.access_token}`
          }
        });
        
        if (error) {
          console.error("Subscription check error:", error);
          setHasActiveSubscription(false);
        } else {
          setHasActiveSubscription(data?.subscribed || false);
        }
      } catch (error) {
        console.error("Subscription check failed:", error);
        setHasActiveSubscription(false);
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    if (isInitialized && !isLoading) {
      checkSubscription();
    }
  }, [isInitialized, isLoading, user]);

  // Wait for auth to initialize
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-navy" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/register" replace />;
  }

  // Still checking subscription status
  if (isCheckingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-navy" />
      </div>
    );
  }

  // No active subscription - redirect to register/checkout
  if (hasActiveSubscription === false) {
    return <Navigate to="/register" replace />;
  }

  // All checks passed - user has active subscription
  return <>{children}</>;
}
