
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { LoginHeader } from "@/components/auth/LoginHeader";
import { LoginForm } from "@/components/auth/LoginForm";
import { RetryWarning } from "@/components/auth/RetryWarning";

const LoginPage = () => {
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const { isInitialized, isLoading: authLoading, user, isEmailVerified, isSubscribed } = useAuth();

  useEffect(() => {
    if (!isInitialized || authLoading) return;
    
    if (user) {
      // Unverified → email-verification
      if (!isEmailVerified) {
        navigate("/email-verification");
      }
      // Verified but not subscribed → subscription-required
      else if (!isSubscribed) {
        navigate("/subscription-required");
      }
      // Good to go → dashboard
      else {
        navigate("/dashboard");
      }
    }
  }, [isInitialized, authLoading, user, isEmailVerified, isSubscribed]);

  // If user is already authenticated and fully verified/subscribed, redirect immediately
  if (user && isEmailVerified && isSubscribed) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-6 font-body">
      <div className="flex flex-col items-center max-w-md w-full">
        <LoginHeader />
        
        {/* Login Form */}
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl font-display text-brand-navy">Log In</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <RetryWarning retryCount={retryCount} />
            <LoginForm retryCount={retryCount} setRetryCount={setRetryCount} />
          </CardContent>
        </Card>
        
        {/* Bottom spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default LoginPage;
