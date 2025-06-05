
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

  // Routes that don't require authentication
  const publicRoutes = ['/welcome', '/login', '/register'];
  // Routes that don't require subscription
  const freeRoutes = ['/welcome', '/login', '/register', '/billing'];

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);
      
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        // Only redirect to login if not on a public route
        if (!publicRoutes.includes(location.pathname)) {
          navigate("/login");
        }
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        // Fetch profile and check subscription only after successful auth
        if (session.user?.id) {
          await fetchUserProfileAndSubscription(session.user.id);
        }
        setIsLoading(false);
        
        // Handle post-login routing
        handlePostLoginRouting(session.user);
      } else if (session) {
        setUser(session.user);
        // Fetch profile and check subscription only if user exists
        if (session.user?.id) {
          await fetchUserProfileAndSubscription(session.user.id);
        }
        setIsLoading(false);
      }
    });
    
    // THEN check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        // Only redirect to login if not on a public route
        if (!publicRoutes.includes(location.pathname)) {
          navigate("/login");
        }
      } else {
        setUser(session.user);
        // Fetch profile and check subscription only if user exists
        if (session.user?.id) {
          await fetchUserProfileAndSubscription(session.user.id);
        }
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const handlePostLoginRouting = (user: any) => {
    // If user just logged in and they're on login/register page
    if (location.pathname === '/login' || location.pathname === '/register') {
      // Check if they have an active subscription
      setTimeout(() => {
        if (profile?.subscription_status === 'active') {
          navigate('/dashboard');
        } else {
          navigate('/billing');
        }
      }, 100);
    }
  };

  const fetchUserProfileAndSubscription = async (userId: string) => {
    try {
      // Fetch profile data first
      const { data: profileData } = await supabase
        .from("profiles")
        .select("address1, address2, city, county, postcode, country, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_tier")
        .eq("id", userId)
        .maybeSingle();
      
      setProfile(profileData);

      // Only check subscription status if profile exists
      if (profileData || user) {
        await checkSubscriptionStatus();
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      // Only call if user is authenticated
      if (!user) return;
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      // Update profile state with fresh subscription data
      setProfile(prev => prev ? {
        ...prev,
        subscription_status: data.subscribed ? 'active' : null,
        subscription_tier: data.subscription_tier
      } : null);

    } catch (error) {
      console.error('Error invoking check-subscription:', error);
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

  // Check if user should be redirected to billing
  const shouldRedirectToBilling = user && !isSubscribed && !freeRoutes.includes(location.pathname);

  useEffect(() => {
    if (!isLoading && shouldRedirectToBilling) {
      navigate('/billing');
    }
  }, [isLoading, shouldRedirectToBilling, navigate]);

  return { 
    user, 
    profile, 
    handleSignOut, 
    isSubscribed, 
    subscriptionTier,
    isLoading,
    refreshProfile: () => user?.id && fetchUserProfileAndSubscription(user.id)
  };
}
