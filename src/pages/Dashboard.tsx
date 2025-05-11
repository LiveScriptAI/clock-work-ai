
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const DashboardPage = () => {
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/login");
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            This is a placeholder dashboard that will be built later
          </p>
        </div>
        
        <Button onClick={handleSignOut} className="w-full bg-red-600 hover:bg-red-700">
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
