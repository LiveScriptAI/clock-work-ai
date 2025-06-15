
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    console.log('CheckoutSuccess params:', { sessionId, success, canceled });

    // Clear checkout state from localStorage
    localStorage.removeItem('checkout_in_progress');
    localStorage.removeItem('checkout_timestamp');

    if (canceled) {
      toast.info("Checkout was canceled. You can try again anytime!");
      setVerificationStatus('error');
      return;
    }

    if (success && sessionId) {
      verifyCheckout(sessionId);
    } else {
      console.error('Missing required parameters for checkout verification');
      setVerificationStatus('error');
    }
  }, [searchParams]);

  const verifyCheckout = async (sessionId: string) => {
    try {
      console.log("Verifying checkout session:", sessionId);
      
      const { data, error } = await supabase.functions.invoke('verify-checkout', {
        body: JSON.stringify({ sessionId })
      });

      if (error) {
        console.error("Verification error:", error);
        toast.error("Failed to verify subscription. Please contact support.");
        setVerificationStatus('error');
        return;
      }

      if (data?.success) {
        console.log("Subscription verified successfully:", data.subscription);
        setSubscriptionInfo(data.subscription);
        setVerificationStatus('success');
        
        // Refresh user profile to get updated subscription status
        await refreshProfile();
        
        toast.success("🎉 Subscription activated successfully! Welcome aboard!");
      } else {
        console.error("Verification failed:", data);
        toast.error("Subscription verification failed. Please contact support.");
        setVerificationStatus('error');
      }
    } catch (error) {
      console.error("Unexpected verification error:", error);
      toast.error("An unexpected error occurred during verification.");
      setVerificationStatus('error');
    }
  };

  if (verificationStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-navy" />
        <h2 className="text-xl font-semibold text-brand-navy">Verifying your subscription...</h2>
        <p className="text-gray-600 text-center max-w-md">
          Please wait while we confirm your payment and activate your subscription.
        </p>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-brand-navy">Subscription Activated! 🎉</h2>
          <p className="text-gray-600">
            Welcome to Clock Work Pal {subscriptionInfo?.tier || 'Premium'}! Your subscription is now active.
          </p>
        </div>
        
        {subscriptionInfo && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 max-w-md w-full">
            <h3 className="font-semibold text-brand-navy mb-2">Subscription Details:</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Plan:</span> {subscriptionInfo.tier}</p>
              <p><span className="font-medium">Status:</span> {subscriptionInfo.status}</p>
              <p><span className="font-medium">Next billing:</span> {new Date(subscriptionInfo.current_period_end * 1000).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-brand-accent text-brand-navy font-semibold"
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/billing')}
            className="border-brand-navy text-brand-navy"
          >
            View Billing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <XCircle className="w-16 h-16 text-red-500" />
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-brand-navy">Something went wrong</h2>
        <p className="text-gray-600">
          We couldn't verify your subscription. Please contact support or try again.
        </p>
      </div>
      
      <div className="flex gap-4">
        <Button 
          onClick={() => navigate('/billing')}
          className="bg-brand-accent text-brand-navy font-semibold"
        >
          Go to Billing
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/welcome')}
          className="border-brand-navy text-brand-navy"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
