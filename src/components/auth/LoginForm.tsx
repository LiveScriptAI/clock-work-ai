
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import RetryWarning from "./RetryWarning";

interface LoginFormProps {
  isPaymentFlow: boolean;
}

const LoginForm = ({ isPaymentFlow }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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
        
        // Check if this is part of a payment verification flow
        const pendingSessionId = localStorage.getItem('pending_session_id');
        if (pendingSessionId) {
          toast({
            title: "Login successful",
            description: "Verifying your payment..."
          });
        } else {
          toast({
            title: "Login successful",
            description: "Checking your subscription status..."
          });
        }
        // Note: useEffect will handle the redirect based on subscription status
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
    <form onSubmit={handleLogin} className="space-y-4">
      <RetryWarning retryCount={retryCount} />
      
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
            {retryCount > 0 ? 'Retrying...' : isPaymentFlow ? 'Verifying Payment...' : 'Logging in...'}
          </>
        ) : retryCount >= 3 ? (
          "Too many attempts - Please wait"
        ) : isPaymentFlow ? (
          "Log In to Verify Payment"
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
  );
};

export default LoginForm;
