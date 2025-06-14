
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isEmailVerified } = useAuth();
  
  useEffect(() => {
    // If user is already logged in and verified, redirect to welcome
    if (user && isEmailVerified) {
      navigate("/welcome");
    }
  }, [user, isEmailVerified, navigate]);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Attempting registration for:', email);
      
      // Set up proper redirect URL for email verification
      const redirectUrl = `${window.location.origin}/email-verification-success`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error('Registration error:', error);
        
        if (error.message.includes('User already registered')) {
          toast.error("Account already exists. Please log in instead.");
        } else if (error.message.includes('Password')) {
          toast.error("Password must be at least 6 characters long.");
        } else {
          toast.error(error.message || "Registration failed. Please try again.");
        }
      } else if (data.user) {
        console.log('Registration successful:', data.user.email);
        
        toast.success("Account created! Please check your email to verify your account.");
        
        // Redirect to email verification page with instructions
        navigate("/email-verification");
      }
    } catch (error) {
      console.error('Unexpected registration error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
