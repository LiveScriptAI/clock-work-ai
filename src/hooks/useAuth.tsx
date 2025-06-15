
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
    console.log("🔐 useAuth: Setting up auth state listener");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email || 'no user');
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("👋 User signed out, clearing state");
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        // Only redirect to login if not on public pages
        if (!['/welcome', '/register', '/login', '/email-verification'].includes(location.pathname)) {
          navigate("/login");
        }
      } else if (session) {
        console.log("👤 User signed in:", session.user.email);
        setUser(session.user);
        
        // Fetch profile data and check subscription status
        if (session.user?.id) {
          await fetchUserProfile(session.user.id);
          
          // After fetching profile, check if we need to redirect based on subscription
          setTimeout(() => {
            checkSubscriptionAndRedirect();
          }, 100);
        }
        setIsLoading(false);
      }
    });
    
    // THEN check for existing session
    const checkSession = async () => {
      console.log("🔍 Checking existing session...");
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Session check error:", error);
          setIsLoading(false);
          return;
        }
        
        if (!session) {
          console.log("❌ No existing session found");
          setIsLoading(false);
          // Only redirect to login if not on public pages and not on welcome page
          if (!['/welcome', '/register', '/login', '/email-verification'].includes(location.pathname)) {
            navigate("/login");
          }
        } else {
          console.log("✅ Found existing session for:", session.user.email);
          setUser(session.user);
          // Fetch profile data and check subscription
          if (session.user?.id) {
            await fetchUserProfile(session.user.id);
            checkSubscriptionAndRedirect();
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("💥 Unexpected session check error:", error);
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const fetchUserProfile = async (userId: string) => {
    console.log("📊 Fetching user profile for:", userId);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("address1, address2, city, county, postcode, country, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_tier")
        .eq("id", userId)
        .maybeSingle();
      
      if (error) {
        console.error("❌ Profile fetch error:", error);
        return;
      }
      
      console.log("✅ Profile fetched:", { 
        hasProfile: !!data,
        subscriptionStatus: data?.subscription_status,
        subscriptionTier: data?.subscription_tier,
        hasStripeCustomer: !!data?.stripe_customer_id
      });
      
      setProfile(data);
    } catch (error) {
      console.error("💥 Unexpected profile fetch error:", error);
    }
  };

  const checkSubscriptionAndRedirect = () => {
    console.log("🧭 Checking subscription and redirect logic", {
      currentPath: location.pathname,
      subscriptionStatus: profile?.subscription_status,
      hasStripeCustomer: !!profile?.stripe_customer_id
    });
    
    // Don't redirect if on public pages or subscription-related pages
    const publicPages = ['/welcome', '/register', '/login', '/email-verification', '/subscription-required', '/billing'];
    if (publicPages.includes(location.pathname)) {
      console.log("📍 On public page, skipping redirect");
      return;
    }

    // Check for users with incomplete payments - they have a stripe_customer_id but no active subscription
    const hasIncompletePayment = profile?.stripe_customer_id && profile?.subscription_status !== 'active';
    
    if (user && hasIncompletePayment) {
      // User started checkout but didn't complete - send to billing page to continue
      console.log("💳 User has incomplete payment, redirecting to billing");
      navigate('/billing');
    } else if (user && !profile?.subscription_status) {
      // User is authenticated but has no subscription attempt yet - redirect to subscription required
      console.log("🚫 User has no subscription, redirecting to subscription required");
      navigate('/subscription-required');
    } else if (user && profile?.subscription_status === 'active' && location.pathname === '/subscription-required') {
      // If user has subscription but is on subscription required page, redirect to dashboard
      console.log("✅ User has active subscription, redirecting to dashboard");
      navigate('/dashboard');
    }
  };

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

  // New method to refresh subscription status (useful after portal management)
  const refreshSubscriptionStatus = async () => {
    console.log("🔄 Refreshing subscription status...");
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  const isSubscribed = profile?.subscription_status === 'active';
  const subscriptionTier = profile?.subscription_tier;
  const hasIncompletePayment = profile?.stripe_customer_id && !isSubscribed;

  console.log("🎯 useAuth current state:", {
    hasUser: !!user,
    isSubscribed,
    subscriptionTier,
    hasIncompletePayment,
    isLoading
  });

  return { 
    user, 
    profile, 
    handleSignOut, 
    isSubscribed, 
    subscriptionTier,
    hasIncompletePayment,
    isLoading,
    refreshProfile: () => user?.id && fetchUserProfile(user.id),
    refreshSubscriptionStatus
  };
}
