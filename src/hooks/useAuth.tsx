
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Extend the profile type to include address fields
interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  address1: string | null;
  address2: string | null;
  city: string | null;
  county: string | null;
  postcode: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        setProfile(data as UserProfile);
      } catch (error) {
        console.error('Error in profile fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        navigate("/login");
        return;
      }
      
      setUser(session.user);
      fetchProfile(session.user.id);
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
        navigate("/login");
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Navigation to login happens via the auth state change listener
  };

  return { user, profile, loading, handleSignOut };
}
