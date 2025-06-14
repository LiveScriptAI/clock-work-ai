
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const EmailVerificationSuccess = () => {
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { isInitialized, isLoading, isEmailVerified, isSubscribed } = useAuth();

  // Wait for auth to initialize
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-navy" />
      </div>
    );
  }

  useEffect(() => {
    const handleVerification = async () => {
      try {
        console.log('Checking email verification status...');

        // Check if we have a session now
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setVerificationStatus('error');
          setErrorMessage('Verification failed. Please try logging in.');
          return;
        }

        if (session?.user) {
          console.log('✅ User verified and logged in:', session.user.email);
          setVerificationStatus('success');
          toast.success('Email verified successfully! You are now logged in.');
        } else {
          // If no session, try to refresh the session
          console.log('No session found, attempting to refresh...');
          await supabase.auth.refreshSession();
          
          const { data: { session: refreshedSession } } = await supabase.auth.getSession();
          
          if (refreshedSession?.user) {
            setVerificationStatus('success');
            toast.success('Email verified successfully! You are now logged in.');
          } else {
            setVerificationStatus('error');
            setErrorMessage('Email verified but login failed. Please try logging in manually.');
          }
        }
      } catch (error) {
        console.error('Verification handling error:', error);
        setVerificationStatus('error');
        setErrorMessage('An unexpected error occurred during verification.');
      }
    };

    handleVerification();
  }, []);

  // Handle navigation after successful verification
  useEffect(() => {
    if (verificationStatus !== 'success') return;
    
    // Give user a moment to see the ✅ success message
    const timer = setTimeout(() => {
      if (isSubscribed) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/subscription-required", { replace: true });
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [verificationStatus, isSubscribed, navigate]);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleWelcomeRedirect = () => {
    navigate('/welcome');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-6 font-body">
      <div className="flex flex-col items-center max-w-md w-full">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/lovable-uploads/5e5ad164-5fad-4fa8-8d19-cbccf2382c0e.png" 
            alt="Clock Work Pal logo" 
            className="w-56 h-auto mx-auto" 
          />
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-display text-brand-navy">
              Email Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {verificationStatus === 'verifying' && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-brand-navy" />
                <div>
                  <h3 className="font-semibold text-brand-navy mb-2">Verifying your email...</h3>
                  <p className="text-sm text-gray-600">Please wait while we confirm your email address.</p>
                </div>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="flex flex-col items-center space-y-4">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <div>
                  <h3 className="font-semibold text-brand-navy mb-2">Email Verified Successfully! ✅</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your email has been verified and you are now logged in. Redirecting you now...
                  </p>
                </div>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="flex flex-col items-center space-y-4">
                <XCircle className="w-12 h-12 text-red-500" />
                <div>
                  <h3 className="font-semibold text-brand-navy mb-2">Verification Issue</h3>
                  <p className="text-sm text-gray-600 mb-4">{errorMessage}</p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleLoginRedirect}
                    className="bg-brand-accent text-brand-navy font-semibold rounded-full"
                  >
                    Try Logging In
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleWelcomeRedirect}
                    className="border-brand-navy text-brand-navy rounded-full"
                  >
                    Back to Welcome
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerificationSuccess;
