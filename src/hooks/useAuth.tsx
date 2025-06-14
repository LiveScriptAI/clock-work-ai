
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  handleSignOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  subscriptionStatus: string | null;
  isSubscribed: boolean;
  profileError: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [profileError, setProfileError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isSubscribed = subscriptionStatus === 'active';

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSubscriptionStatus(null);
      setProfileError(false);
      // Clear any pending session IDs
      localStorage.removeItem('pending_session_id');
      navigate('/welcome');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, full_name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If user doesn't exist in profiles table, this is a critical issue
        if (error.code === 'PGRST116') {
          console.log('Profile not found for authenticated user - setting profile error');
          setProfileError(true);
          setSubscriptionStatus(null);
          toast.error('Account setup incomplete. Please log out and create a new account.');
          return;
        }
        
        setProfileError(true);
        return;
      }

      if (data) {
        console.log('Profile found:', data);
        setSubscriptionStatus(data.subscription_status);
        setProfileError(false);
      } else {
        console.log('No profile data returned');
        setProfileError(true);
        setSubscriptionStatus(null);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setProfileError(true);
      setSubscriptionStatus(null);
    }
  };

  const refreshProfile = async () => {
    console.log('Refreshing profile...');
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session with better error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log('Initial session check:', session?.user?.email || 'No session');
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user?.id) {
            await fetchUserProfile(session.user.id);
          } else {
            setProfileError(false);
            setSubscriptionStatus(null);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth state
    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'No session');
      
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN' && session?.user?.id) {
        console.log('User signed in:', session.user.email);
        await fetchUserProfile(session.user.id);
        
        // CRITICAL FIX: Check for pending session verification after login
        const pendingSessionId = localStorage.getItem('pending_session_id');
        if (pendingSessionId && location.pathname !== '/thank-you') {
          console.log('Found pending session after login, redirecting to thank-you page');
          navigate(`/thank-you?session_id=${pendingSessionId}`);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setSubscriptionStatus(null);
        setProfileError(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user?.id) {
        console.log('Token refreshed for user:', session.user.email);
        // Optionally refresh profile on token refresh
        await fetchUserProfile(session.user.id);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const value = {
    user,
    session,
    loading,
    handleSignOut,
    refreshProfile,
    subscriptionStatus,
    isSubscribed,
    profileError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
