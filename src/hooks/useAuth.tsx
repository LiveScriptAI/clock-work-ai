
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        // Only redirect to login if not on public pages
        if (!['/welcome', '/register', '/login', '/email-verification', '/billing'].includes(location.pathname)) {
          navigate("/login");
        }
      } else if (session) {
        setUser(session.user);
        
        // Fetch profile data and check subscription status
        if (session.user?.id) {
          await fetchUserProfile(session.user.id);
          
          // Small delay to ensure profile is updated before redirect check
          setTimeout(() => {
            if (mounted) {
              checkSubscriptionAndRedirect();
            }
          }, 100);
        }
        setIsLoading(false);
      }
    });
    
    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (!session) {
          setIsLoading(false);
          // Only redirect to login if not on public pages
          if (!['/welcome', '/register', '/login', '/email-verification', '/billing'].includes(location.pathname)) {
            navigate("/login");
          }
        } else {
          setUser(session.user);
          // Fetch profile data and check subscription
          if (session.user?.id) {
            await fetchUserProfile(session.user.id);
            checkSubscriptionAndRedirect();
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    checkSession();
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("address1, address2, city, county, postcode, country, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_tier")
        .eq("id", userId)
        .maybeSingle();
      
      console.log('Profile fetched:', data);
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const checkSubscriptionAndRedirect = () => {
    // Don't redirect if on public pages or subscription-related pages
    const publicPages = ['/welcome', '/register', '/login', '/email-verification', '/subscription-required', '/billing'];
    const currentPath = location.pathname;
    
    console.log('Checking subscription redirect:', { 
      currentPath, 
      isPublicPage: publicPages.includes(currentPath),
      subscriptionStatus: profile?.subscription_status 
    });
    
    if (publicPages.includes(currentPath)) {
      return;
    }

    // If user is authenticated but doesn't have active subscription, redirect to subscription required
    if (user && profile?.subscription_status !== 'active') {
      console.log('Redirecting to subscription required');
      navigate('/subscription-required');
    } else if (user && profile?.subscription_status === 'active' && currentPath === '/subscription-required') {
      // If user has subscription but is on subscription required page, redirect to dashboard
      console.log('User has active subscription, redirecting to dashboard');
      navigate('/dashboard');
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
    isLoading,
    refreshProfile: () => user?.id && fetchUserProfile(user.id)
  };
}
