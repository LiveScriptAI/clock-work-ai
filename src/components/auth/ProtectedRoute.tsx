
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import React from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const {
    isLoading,
    isInitialized,
    user,
    isEmailVerified,
    isSubscribed,
  } = useAuth();

  if (!isInitialized || isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isEmailVerified) {
    return <Navigate to="/email-verification" />;
  }

  if (!isSubscribed) {
    return <Navigate to="/subscription-required" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
