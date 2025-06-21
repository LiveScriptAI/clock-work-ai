
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TrialSetup } from "@/components/dashboard/TrialSetup";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isInitialized, isLoading, user, isEmailVerified } = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || !isEmailVerified) {
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
  }, [isInitialized, isLoading, user, isEmailVerified]);

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

  // Email not verified
  if (!isEmailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <img 
              src="/lovable-uploads/5e5ad164-5fad-4fa8-8d19-cbccf2382c0e.png" 
              alt="Clock Work Pal logo" 
              className="w-48 h-auto mx-auto"
            />
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-display text-brand-navy mb-4">
              Please Verify Your Email
            </h2>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </p>
            <p className="text-sm text-gray-500">
              Can't find the email? Check your spam folder or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Still checking subscription status
  if (isCheckingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-navy" />
      </div>
    );
  }

  // No active subscription - show trial setup
  if (hasActiveSubscription === false) {
    return <TrialSetup onTrialStarted={() => setHasActiveSubscription(null)} />;
  }

  // All checks passed - user has active subscription
  return <>{children}</>;
}
