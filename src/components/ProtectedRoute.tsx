
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export default function ProtectedRoute({
  children,
  requireSubscription = true,
}: ProtectedRouteProps) {
  const {
    isInitialized,
    isLoading,
    user,
    isEmailVerified,
    isSubscribed,
    hasIncompletePayment,
  } = useAuth();

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
    return <Navigate to="/login" replace />;
  }

  // Email not verified
  if (!isEmailVerified) {
    return <Navigate to="/email-verification" replace />;
  }

  // Subscription required but payment incomplete
  if (requireSubscription && hasIncompletePayment) {
    return <Navigate to="/billing" replace />;
  }

  // Subscription required but not subscribed
  if (requireSubscription && !isSubscribed) {
    return <Navigate to="/subscription-required" replace />;
  }

  // All checks passed
  return <>{children}</>;
}
