import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);

  // Routes that don't require authentication
  const publicRoutes = ['/welcome', '/login', '/register', '/billing'];

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session);
      
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
        // Only redirect to login if not on a public route
        if (!publicRoutes.includes(location.pathname)) {
          navigate("/login");
        }
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        // Fetch profile data if user is authenticated
        if (session.user?.id) {
          fetchUserProfile(session.user.id);
        }
      } else if (session) {
        setUser(session.user);
        // Fetch profile data if user is authenticated
        if (session.user?.id) {
          fetchUserProfile(session.user.id);
        }
      }
    });
    
    // THEN check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Only redirect to login if not on a public route
        if (!publicRoutes.includes(location.pathname)) {
          navigate("/login");
        }
      } else {
        setUser(session.user);
        // Fetch profile data if user is authenticated
        if (session.user?.id) {
          fetchUserProfile(session.user.id);
        }
      }
    };
    
    checkSession();
    
    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

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
      // The navigation will be handled by the auth state change listener
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
