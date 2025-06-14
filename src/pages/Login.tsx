
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/auth/LoadingSpinner";
import LoginContainer from "@/components/auth/LoginContainer";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isSubscribed, loading: authLoading } = useAuth();

  useEffect(() => {
    // Only redirect if auth is not loading and user exists
    if (!authLoading && user) {
      console.log('User logged in, checking subscription:', { user: user.email, isSubscribed });
      
      // Check if there's a pending session ID (user came from payment flow)
      const pendingSessionId = localStorage.getItem('pending_session_id');
      if (pendingSessionId) {
        console.log('Found pending session after login, redirecting to thank-you page');
        navigate(`/thank-you?session_id=${pendingSessionId}`);
        return;
      }
      
      // Normal login flow - check subscription
      if (isSubscribed) {
        // Check if there was a redirect path stored
        const redirectPath = localStorage.getItem('redirect_after_payment');
        if (redirectPath) {
          localStorage.removeItem('redirect_after_payment');
          navigate(redirectPath);
        } else {
          navigate("/dashboard");
        }
      } else {
        // User is authenticated but doesn't have subscription - redirect to welcome
        console.log('User authenticated but no subscription - redirecting to welcome');
        navigate("/welcome");
        toast({
          title: "Complete your subscription",
          description: "Please complete your payment to access the dashboard."
        });
      }
    }
  }, [user, isSubscribed, authLoading, navigate]);

  // Show loading only briefly during auth initialization
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // Check if user came from payment flow
  const pendingSessionId = localStorage.getItem('pending_session_id');
  const isPaymentFlow = pendingSessionId || location.state?.fromPayment;

  return <LoginContainer isPaymentFlow={isPaymentFlow} />;
};

export default LoginPage;
