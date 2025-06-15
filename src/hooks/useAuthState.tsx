
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "@/types/auth";

export function useAuthState() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleSignOut = async () => {
    try {
      console.log("🚪 Attempting to sign out...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("❌ Error signing out:", error);
        return;
      }
      
      console.log("✅ Sign out successful");
      // Navigate to welcome page after sign out
      navigate('/welcome');
    } catch (error) {
      console.error("💥 Unexpected error during sign out:", error);
    }
  };

  return {
    user,
    setUser,
    isLoading,
    setIsLoading,
    isInitialized,
    setIsInitialized,
    handleSignOut
  };
}
