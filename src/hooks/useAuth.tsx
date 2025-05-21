
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
};

export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
        navigate("/login");
      } else {
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
        navigate("/login");
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
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("address1, address2, city, county, postcode, country")
      .eq("id", userId)
      .maybeSingle();
    
    setProfile(data);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Error signing out:", error);
      return;
    }
    
    // We don't need to navigate manually as the auth state change listener will handle it
    // The navigation happens in the onAuthStateChange listener
  };

  return { user, profile, handleSignOut };
}
