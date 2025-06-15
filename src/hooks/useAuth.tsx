
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "./useAuthState";
import { useProfile } from "./useProfile";
import { useAuthRedirection } from "./useAuthRedirection";

export function useAuth() {
  const location = useLocation();
  const {
    user,
    setUser,
    isLoading,
    setIsLoading,
    isInitialized,
    setIsInitialized,
    handleSignOut
  } = useAuthState();

  const {
    profile,
    setProfile,
    fetchUserProfile,
    refreshProfile,
    refreshSubscriptionStatus
  } = useProfile();

  const {
    checkSubscriptionAndRedirect,
    handleUnauthenticatedRedirect
  } = useAuthRedirection();

  useEffect(() => {
    console.log("🔐 useAuth: Setting up auth state listener");
    
    // Check for existing session FIRST
    const initializeAuth = async () => {
      try {
        console.log("🔍 Checking existing session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Session check error:", error);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }
        
        if (session?.user) {
          console.log("✅ Found existing session for:", session.user.email);
          setUser(session.user);
          await fetchUserProfile(session.user.id);
          checkSubscriptionAndRedirect(session.user, profile);
        } else {
          console.log("❌ No existing session found");
          setUser(null);
          setProfile(null);
          handleUnauthenticatedRedirect();
        }
        
        setIsLoading(false);
        setIsInitialized(true);
      } catch (error) {
        console.error("💥 Unexpected session check error:", error);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    // Set up auth state listener AFTER initial check
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only process auth changes after initialization
      if (!isInitialized) return;
      
      console.log('🔄 Auth state change:', event, session?.user?.email || 'no user');
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("👋 User signed out, clearing state");
        setUser(null);
        setProfile(null);
        handleUnauthenticatedRedirect();
      } else if (session?.user) {
        console.log("👤 User signed in:", session.user.email);
        setUser(session.user);
        
        // Fetch profile data and check subscription status
        await fetchUserProfile(session.user.id);
        
        // After fetching profile, check if we need to redirect based on subscription
        setTimeout(() => {
          checkSubscriptionAndRedirect(session.user, profile);
        }, 100);
      }
    });
    
    // Initialize auth state
    initializeAuth();
    
    return () => subscription.unsubscribe();
  }, [location.pathname, isInitialized]);

  const isSubscribed = profile?.subscription_status === 'active';
  const subscriptionTier = profile?.subscription_tier;
  const hasIncompletePayment = profile?.stripe_customer_id && !isSubscribed;

  console.log("🎯 useAuth current state:", {
    hasUser: !!user,
    isSubscribed,
    subscriptionTier,
    hasIncompletePayment,
    isLoading,
    isInitialized
  });

  return { 
    user, 
    profile, 
    handleSignOut, 
    isSubscribed, 
    subscriptionTier,
    hasIncompletePayment,
    isLoading,
    refreshProfile: () => refreshProfile(user?.id),
    refreshSubscriptionStatus: () => refreshSubscriptionStatus(user?.id)
  };
}
