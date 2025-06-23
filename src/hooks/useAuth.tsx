
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ProfileType = {
  address1?: string;
  address2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  subscription_status?: string;
  stripe_subscription_id?: string;
};

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session);
      
      if (session) {
        setUser(session.user);
        // Fetch profile data if user is authenticated
        if (session.user?.id) {
          fetchUserProfile(session.user.id);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });
    
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setIsLoading(false);
          return;
        }
        
        if (session) {
          setUser(session.user);
          // Fetch profile data if user is authenticated
          if (session.user?.id) {
            fetchUserProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error("Exception in checkSession:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("address1, address2, city, county, postcode, country, subscription_status, stripe_subscription_id")
        .eq("id", userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching profile:", error);
        return;
      }
      
      console.log("Profile data:", data);
      setProfile(data);
    } catch (error) {
      console.error("Exception in fetchUserProfile:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log("Attempting to sign out...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        return;
      }
      
      console.log("Sign out successful");
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
    }
  };

  return { user, profile, handleSignOut, isLoading };
}
