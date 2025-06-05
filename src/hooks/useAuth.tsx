
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export type ProfileType = {
  address1?: string;
  address2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: string;
  subscription_tier?: string;
};

export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session);
      
      // Only update state synchronously here
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
      } else if (session) {
        setUser(session.user);
        // Defer profile fetching to avoid render issues
        if (session.user?.id) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        }
      }
      
      setIsInitialized(true);
    });
    
    // THEN check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        // Fetch profile data if user is authenticated
        if (session.user?.id) {
          fetchUserProfile(session.user.id);
        }
      }
      setIsInitialized(true);
    };
    
    checkSession();
    
    return () => subscription.unsubscribe();
  }, []);

  // Separate effect to handle navigation after state is initialized
  useEffect(() => {
    if (!isInitialized) return;
    
    // Only navigate to login if we're on a protected route and not authenticated
    const currentPath = window.location.pathname;
    const protectedRoutes = ['/dashboard', '/billing'];
    const isProtectedRoute = protectedRoutes.includes(currentPath);
    
    if (!user && isProtectedRoute) {
      navigate("/login");
    }
  }, [user, isInitialized, navigate]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("address1, address2, city, county, postcode, country, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_tier")
        .eq("id", userId)
        .maybeSingle();
      
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
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
      // Navigate after successful sign out
      navigate("/login");
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
    }
  };

  const isSubscribed = profile?.subscription_status === 'active';
  const subscriptionTier = profile?.subscription_tier;

  return { 
    user, 
    profile, 
    handleSignOut, 
    isSubscribed, 
    subscriptionTier,
    refreshProfile: () => user?.id && fetchUserProfile(user.id)
  };
}
