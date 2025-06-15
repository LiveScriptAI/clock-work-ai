
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ProfileType } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileType | null;
  isLoading: boolean;
  isInitialized: boolean;
  isEmailVerified: boolean;
  isSubscribed: boolean;
  subscriptionTier: string | null;
  hasIncompletePayment: boolean;
  signOut: () => Promise<void>;
  handleSignOut: () => Promise<void>; // Add alias for backward compatibility
  refreshProfile: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const logStep = (step: string, details?: any) => {
    console.log(`[AUTH] ${step}`, details ? details : '');
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      logStep('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("address1, address2, city, county, postcode, country, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_tier")
        .eq("id", userId)
        .maybeSingle();
      
      if (error) {
        console.error("Profile fetch error:", error);
        return;
      }
      
      logStep('Profile fetched successfully', {
        hasProfile: !!data,
        subscriptionStatus: data?.subscription_status,
        subscriptionTier: data?.subscription_tier
      });
      
      setProfile(data);
    } catch (error) {
      console.error("Unexpected profile fetch error:", error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  const refreshSubscriptionStatus = async () => {
    logStep('Refreshing subscription status...');
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  const signOut = async () => {
    try {
      logStep('Signing out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        return;
      }
      
      // Clear all state
      setUser(null);
      setSession(null);
      setProfile(null);
      
      logStep('Sign out successful');
    } catch (error) {
      console.error("Unexpected sign out error:", error);
    }
  };

  // Alias for backward compatibility
  const handleSignOut = signOut;

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        logStep('Initializing auth...');
        
        // Check for existing session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          if (mounted) {
            setIsLoading(false);
            setIsInitialized(true);
          }
          return;
        }
        
        if (initialSession?.user && mounted) {
          logStep('Found existing session', { email: initialSession.user.email });
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchUserProfile(initialSession.user.id);
        } else {
          logStep('No existing session found');
        }
        
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || !isInitialized) return;
      
      logStep('Auth state changed:', { event, email: session?.user?.email });
      
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setSession(null);
        setProfile(null);
      } else if (session?.user) {
        setSession(session);
        setUser(session.user);
        
        // Fetch profile after a short delay to avoid race conditions
        setTimeout(() => {
          if (mounted) {
            fetchUserProfile(session.user.id);
          }
        }, 100);
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isEmailVerified = !!user?.email_confirmed_at;
  const isSubscribed = profile?.subscription_status === 'active';
  const subscriptionTier = profile?.subscription_tier || null;
  
  // Check for incomplete payment - this would be when user has a subscription but it's not active
  const hasIncompletePayment = !!(profile?.stripe_subscription_id && profile?.subscription_status !== 'active');

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isInitialized,
    isEmailVerified,
    isSubscribed,
    subscriptionTier,
    hasIncompletePayment,
    signOut,
    handleSignOut,
    refreshProfile,
    refreshSubscriptionStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
