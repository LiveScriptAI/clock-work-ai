
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    
    checkSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/dashboard");
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message
        });
      } else {
        toast({
          title: "Login successful",
          description: "You are now logged in."
        });
        // The onAuthStateChange listener will handle navigation to dashboard
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An unexpected error occurred."
      });
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

        {/* Clock Character with Login Form */}
        <div className="relative">
          {/* Clock Character */}
          <img 
            src="/lovable-uploads/64352fd1-d5b9-4715-8db3-6ad74c6f8826.png" 
            alt="Clock character holding login form" 
            className="w-96 h-auto mx-auto mb-4"
          />
          
          {/* Login Form positioned over the blank space */}
          <Card className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 w-80 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-xl font-display text-brand-navy">Log In</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <form onSubmit={handleLogin} className="space-y-4">
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
                    required
                    className="font-body"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-brand-accent text-brand-navy font-semibold rounded-full shadow-lg hover:opacity-90 transition font-body"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
                
                <div className="text-center mt-3">
                  <Link 
                    to="/register" 
                    className="text-brand-navy text-sm hover:underline font-body"
                  >
                    Don't have an account? Sign up
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
        
        {/* Add some bottom spacing for the overlapping form */}
        <div className="h-40"></div>
      </div>
    </div>
  );
};

export default LoginPage;
