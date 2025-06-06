import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [startingTrial, setStartingTrial] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, 'Session:', session);
      
      // If user just signed in and we're showing the email verification screen, keep them here
      if (event === 'SIGNED_IN' && session && emailSent) {
        // User has verified their email, they can now start the trial
        console.log('User verified email and signed in');
        return;
      }
      
      // Only redirect to dashboard if user is signed in AND not in email verification flow
      if (event === 'SIGNED_IN' && session && !emailSent) {
        navigate("/dashboard");
      }
    });
    
    // Check if user is already logged in (but not in verification flow)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !emailSent) {
        navigate("/dashboard");
      }
    };
    
    checkSession();
    
    return () => subscription.unsubscribe();
  }, [navigate, emailSent]);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/register`
        }
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message
        });
      } else if (data.user) {
        setEmailSent(true);
        toast({
          title: "Registration successful",
          description: "Please check your email to verify your account."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "An unexpected error occurred."
      });
    } finally {
      setIsLoading(false);
    }
  };

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
  
  if (emailSent) {
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
                      <span>Check your email inbox at <strong>{email}</strong></span>
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
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl font-display text-brand-navy">Create Account</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="font-body text-brand-navy">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="font-body"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="font-body text-brand-navy">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="font-body"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="font-body text-brand-navy">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  className="font-body"
                />
                <p className="text-xs text-gray-500 font-body">Password must be at least 6 characters</p>
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-brand-accent text-brand-navy font-semibold rounded-full shadow-lg hover:opacity-90 transition font-body"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
              
              <div className="text-center mt-3">
                <Link 
                  to="/login" 
                  className="text-brand-navy text-sm hover:underline font-body"
                >
                  Already have an account? Log in
                </Link>
              </div>
              
              <div className="text-center">
                <Link 
                  to="/welcome" 
                  className="text-gray-500 text-sm hover:underline font-body"
                >
                  Back to Welcome
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
