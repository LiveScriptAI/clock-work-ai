
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const EmailVerificationPage = () => {
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUserEmail(session.user.email || "");
        } else {
          // Check if there's a pending email in localStorage
          const storedEmail = localStorage.getItem('pendingVerificationEmail');
          if (storedEmail) {
            setUserEmail(storedEmail);
          }
        }
      } catch (error) {
        console.error("Error getting user email:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getUserEmail();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        toast({
          title: "Email verified successfully!",
          description: "You can now return to the home page to start your free trial."
        });
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-6 font-body">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }
  
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
              Email Verification Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {/* Trial Image */}
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/90e6bdbe-5dfb-4b07-ad8d-434598f6bdcd.png" 
                alt="7 Day Free Trial" 
                className="w-64 h-auto rounded-lg shadow-md"
              />
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-brand-navy mb-4 text-lg">Follow these simple steps:</h3>
                <ol className="text-left space-y-3 text-sm text-brand-navy">
                  <li className="flex items-start">
                    <span className="bg-brand-accent text-brand-navy rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                    <span>Check your email inbox at <strong>{userEmail}</strong> for a verification email</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-brand-accent text-brand-navy rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                    <span>Click the verification link in that email</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-brand-accent text-brand-navy rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                    <span>You'll be redirected back to the home page</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-brand-accent text-brand-navy rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                    <span>Click the <strong>"7 Day Free Trial"</strong> button in the hero section to start your subscription</span>
                  </li>
                </ol>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-brand-navy">
                  <strong>✓ No credit card required for the trial</strong><br/>
                  <strong>✓ Cancel anytime during the trial period</strong><br/>
                  <strong>✓ Full access to all Clock Work Pal features</strong>
                </p>
              </div>
            </div>
            
            <div className="text-center space-y-2 pt-4 border-t border-gray-200">
              <Link 
                to="/welcome" 
                className="text-brand-navy text-sm hover:underline font-body block"
              >
                Return to Home Page
              </Link>
              <Link 
                to="/login" 
                className="text-gray-500 text-sm hover:underline font-body block"
              >
                Already verified? Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
