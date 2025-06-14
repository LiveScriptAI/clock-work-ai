
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile, user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyCheckout = async () => {
      console.log('ThankYou page loaded - checking for session ID');
      
      const sessionId = searchParams.get('session_id');
      
      console.log('Thank You page - Session ID from URL:', sessionId);
      console.log('Current user:', user?.email);
      
      // If no session ID, this person shouldn't be on this page
      if (!sessionId) {
        console.log('No session ID found - redirecting to welcome');
        navigate('/welcome', { replace: true });
        return;
      }

      // If no user is logged in, store session ID and redirect to login
      if (!user) {
        console.log('No user logged in, storing session ID and redirecting to login');
        localStorage.setItem('pending_session_id', sessionId);
        setStatus('error');
        setMessage('Your payment was successful! Please log in to activate your subscription.');
        return;
      }

      try {
        console.log('Calling verify-checkout-session with session ID:', sessionId);
        console.log('User context:', { userId: user.id, email: user.email });
        
        const { data, error } = await supabase.functions.invoke('verify-checkout-session', {
          body: { session_id: sessionId }
        });

        console.log('Verification response:', { data, error });

        if (error) {
          console.error('Verification error:', error);
          throw error;
        }

        if (data?.success) {
          console.log('Payment verification successful');
          setStatus('success');
          setMessage('Your subscription has been activated successfully!');
          
          // Clear any stored session ID
          localStorage.removeItem('pending_session_id');
          
          // Refresh the user profile to get updated subscription status
          console.log('Refreshing user profile...');
          await refreshProfile();
          
          toast.success('Welcome to premium! Your 7-day trial has started.');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            console.log('Redirecting to dashboard...');
            navigate('/dashboard');
          }, 3000);
        } else {
          console.error('Verification failed:', data);
          throw new Error(data?.error || 'Verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        
        let errorMessage = 'There was an issue verifying your payment.';
        
        if (error instanceof Error) {
          if (error.message.includes('session_id')) {
            errorMessage = 'Invalid session. Please retry your payment or contact support.';
          } else if (error.message.includes('Payment not completed')) {
            errorMessage = 'Payment was not completed. Please try again.';
          } else if (error.message.includes('No active subscription')) {
            errorMessage = 'No active subscription found. Please contact support if your payment was charged.';
          } else if (error.message.includes('User not found')) {
            errorMessage = 'We couldn\'t find your account. Please make sure you\'re logged in with the same email used for payment.';
          }
        }
        
        setMessage(errorMessage);
        toast.error('Payment verification failed');
      }
    };

    // Check for pending session ID from localStorage (after login redirect)
    const checkPendingSession = () => {
      const pendingSessionId = localStorage.getItem('pending_session_id');
      if (pendingSessionId && user) {
        console.log('Found pending session ID after login:', pendingSessionId);
        // Update URL with session ID and trigger verification
        const url = new URL(window.location.href);
        url.searchParams.set('session_id', pendingSessionId);
        window.history.replaceState({}, '', url.toString());
        // Re-trigger effect with new session ID
        setTimeout(() => verifyCheckout(), 100);
        return;
      }
      verifyCheckout();
    };

    // Small delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      checkPendingSession();
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchParams, navigate, refreshProfile, user]);

  const handleRetry = () => {
    navigate('/welcome');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 px-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
            <p className="text-gray-600">Please wait while we verify your subscription...</p>
            {user && (
              <p className="text-sm text-gray-500 mt-2">Logged in as: {user.email}</p>
            )}
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">Your 7-Day Trial Includes:</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ Unlimited time tracking</li>
                <li>✓ Professional invoicing</li>
                <li>✓ Export timesheets</li>
                <li>✓ All premium features</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Redirecting to your dashboard in a few seconds...
            </p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Go to Dashboard Now
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Issue</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              {!user ? (
                <Button onClick={handleLogin} className="w-full">
                  Log In to Verify Payment
                </Button>
              ) : (
                <Button onClick={handleRetry} className="w-full">
                  Try Payment Again
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/welcome')} className="w-full">
                Back to Welcome
              </Button>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <p>If you were charged but still see this error, please contact support.</p>
              {user && <p>Currently logged in as: {user.email}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ThankYou;
