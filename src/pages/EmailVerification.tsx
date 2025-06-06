
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const EmailVerificationPage = () => {
  const [startingTrial, setStartingTrial] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in and verified
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is verified and logged in, they can proceed with trial
        setUserEmail(session.user.email || "");
      } else {
        // Check if there's an email in localStorage from registration
        const storedEmail = localStorage.getItem('pendingVerificationEmail');
        if (storedEmail) {
          setUserEmail(storedEmail);
        } else {
          // No pending verification, redirect to register
          navigate("/register");
        }
      }
    };
    
    checkSession();
    
    // Set up auth state listener to detect when user verifies email
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUserEmail(session.user.email || "");
        toast({
          title: "Email verified successfully!",
          description: "You can now start your free trial."
        });
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleStartFreeTrial = async () => {
    setStartingTrial(true);
    try {
      // Check if user is verified by getting the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Email not verified yet",
          description: "Please verify your email first by clicking the link in your inbox, then return here to start your free trial."
        });
        setStartingTrial(false);
        return;
      }

      // Create Stripe checkout session for the free trial
      const { data, error } = await supabase.functions.invoke('create-checkout-session');
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error starting trial",
          description: "Unable to start your free trial. Please try again."
        });
      } else if (data?.url) {
        // Clear the stored email since verification is complete
        localStorage.removeItem('pendingVerificationEmail');
        // Redirect to Stripe checkout
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error starting trial",
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setStartingTrial(false);
    }
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
            <CardTitle className="text-center text-2xl font-display text-brand-navy">Email Verification Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-brand-navy mb-2">Follow these 3 simple steps:</h3>
                <ol className="text-left space-y-2 text-sm text-brand-navy">
                  <li className="flex items-start">
                    <span className="bg-brand-accent text-brand-navy rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                    <span>Check your email inbox at <strong>{userEmail}</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-brand-accent text-brand-navy rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                    <span>Click the verification link in the email</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-brand-accent text-brand-navy rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                    <span>Return here and click the button below to start your free trial</span>
                  </li>
                </ol>
              </div>
              
              <p className="text-sm text-gray-600 font-body">
                After verifying your email, you'll be able to start your 7-day free trial with full access to all Clock Work Pal features.
              </p>
            </div>
            
            <Button 
              onClick={handleStartFreeTrial}
              disabled={startingTrial}
              className="w-full bg-brand-accent text-brand-navy font-semibold rounded-full shadow-lg hover:opacity-90 transition font-body text-lg py-6"
            >
              {startingTrial ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting your free trial...
                </>
              ) : (
                "Start Your 7-Day Free Trial"
              )}
            </Button>
            
            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>✓ No credit card required</p>
              <p>✓ Cancel anytime</p>
              <p>✓ Full access to all features</p>
            </div>
            
            <div className="text-center space-y-2">
              <Link 
                to="/login" 
                className="text-brand-navy text-sm hover:underline font-body block"
              >
                Already verified? Sign in here
              </Link>
              <Link 
                to="/welcome" 
                className="text-gray-500 text-sm hover:underline font-body block"
              >
                Back to Welcome
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
