
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LoginFormProps {
  retryCount: number;
  setRetryCount: (count: number) => void;
}

export const LoginForm = ({ retryCount, setRetryCount }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
        setRetryCount(retryCount + 1);
        
        // Handle specific error cases
        if (error.message.includes('captcha') || 
            error.message.includes('verification process failed') ||
            error.message.includes('Security verification required')) {
          toast.error(retryCount < 2 
            ? "Security verification required: Please wait a moment and try again." 
            : "Security verification required: Multiple failed attempts detected. Please wait a few minutes before trying again, or contact support if the issue persists."
          );
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error("Login failed: Please check your email and password and try again.");
        } else if (error.message.includes('Email not confirmed')) {
          toast.error("Email not confirmed: Please check your email and click the confirmation link before logging in.");
        } else {
          toast.error(`Login failed: ${error.message}`);
        }
      } else if (data.user) {
        console.log('Login successful:', data.user.email);
        setRetryCount(0); // Reset retry count on success
        toast.success("Login successful: Checking your verification and subscription status...");
        // The useEffect hook will handle the redirect based on user status
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast.error("Login failed: An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
};
