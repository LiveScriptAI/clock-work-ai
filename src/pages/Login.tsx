
import React, { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
  }, [isInitialized, authLoading, user, isEmailVerified, isSubscribed, navigate]);

  // If user is already authenticated and fully verified/subscribed, redirect immediately
  if (user && isEmailVerified && isSubscribed) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Attempting login for:', email);
      
      // If we've had multiple failures, add a small delay
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setRetryCount(prev => prev + 1);
        
        // Handle specific error cases
        if (error.message.includes('captcha') || 
            error.message.includes('verification process failed') ||
            error.message.includes('Security verification required')) {
          toast({
            variant: "destructive",
            title: "Security verification required",
            description: retryCount < 2 
              ? "Please wait a moment and try again." 
              : "Multiple failed attempts detected. Please wait a few minutes before trying again, or contact support if the issue persists."
          });
        } else if (error.message.includes('Invalid login credentials')) {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: "Please check your email and password and try again."
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            variant: "destructive",
            title: "Email not confirmed",
            description: "Please check your email and click the confirmation link before logging in."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: error.message
          });
        }
      } else if (data.user) {
        console.log('Login successful:', data.user.email);
        setRetryCount(0); // Reset retry count on success
        toast({
          title: "Login successful",
          description: "Checking your verification and subscription status..."
        });
        // The useEffect hook will handle the redirect based on user status
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-6 font-body">
      <div className="flex flex-col items-center max-w-md w-full">
        {/* Logo */}
        <div className="mb-8 mt-8">
          <img src="/lovable-uploads/5e5ad164-5fad-4fa8-8d19-cbccf2382c0e.png" alt="Clock Work Pal logo" className="w-56 h-auto mx-auto" />
        </div>

        {/* Clock Character */}
        <div className="mb-8">
          
        </div>
        
        {/* Login Form */}
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl font-display text-brand-navy">Log In</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            {retryCount >= 2 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Multiple login attempts detected. Please wait a moment before trying again.
                </p>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-body text-brand-navy">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="your.email@example.com" 
                  required 
                  className="font-body" 
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="font-body text-brand-navy">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  className="font-body"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading || retryCount >= 3} 
                className="w-full bg-brand-accent text-brand-navy font-semibold rounded-full shadow-lg hover:opacity-90 transition font-body"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {retryCount > 0 ? 'Retrying...' : 'Logging in...'}
                  </>
                ) : retryCount >= 3 ? (
                  "Too many attempts - Please wait"
                ) : (
                  "Log In"
                )}
              </Button>
              
              <div className="text-center mt-3">
                <Link to="/register" className="text-brand-navy text-sm hover:underline font-body">
                  Don't have an account? Sign up
                </Link>
              </div>
              
              <div className="text-center">
                <Link to="/welcome" className="text-gray-500 text-sm hover:underline font-body">
                  Back to Welcome
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Bottom spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default LoginPage;
