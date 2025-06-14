
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

  const clearAllCachedData = () => {
    // Clear all localStorage data
    localStorage.clear();
    
    // Clear sessionStorage data
    sessionStorage.clear();
    
    // Clear any IndexedDB supabase data
    if (window.indexedDB) {
      const deleteReq = indexedDB.deleteDatabase('supabase-js-auth');
      deleteReq.onsuccess = () => console.log('Cleared Supabase auth database');
    }
    
    console.log('All cached authentication data cleared');
  };

  const handleSignOut = async () => {
    try {
      console.log('Signing out user...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all state
      setSubscriptionStatus(null);
      setProfileError(false);
      setUser(null);
      setSession(null);
      
      // Clear all cached data
      clearAllCachedData();
      
      navigate('/welcome');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if sign out fails, clear everything locally
      clearAllCachedData();
      setUser(null);
      setSession(null);
      setSubscriptionStatus(null);
      setProfileError(false);
      navigate('/welcome');
      toast.error('Signed out locally');
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
        
        // If user doesn't exist in profiles table, this means they were deleted
        if (error.code === 'PGRST116') {
          console.log('Profile not found - user was likely deleted. Clearing session...');
          await handleSignOut();
          toast.error('Your account was removed. Please create a new account.');
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
        console.log('No profile data returned - clearing session');
        await handleSignOut();
        toast.error('Account not found. Please create a new account.');
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // If there's a network error or other issues, sign out to be safe
      await handleSignOut();
      toast.error('Unable to verify account. Please log in again.');
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
        console.log('Initializing auth state...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            clearAllCachedData();
            setLoading(false);
          }
          return;
        }

        console.log('Initial session check:', session?.user?.email || 'No session');
        
        if (mounted) {
          if (session?.user?.id) {
            // Validate that the user still exists by checking their profile
            try {
              const { data, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', session.user.id)
                .single();
              
              if (profileError || !data) {
                console.log('User session exists but profile missing - clearing invalid session');
                await supabase.auth.signOut();
                clearAllCachedData();
                setSession(null);
                setUser(null);
                setLoading(false);
                return;
              }
              
              // User is valid, proceed with normal auth
              setSession(session);
              setUser(session.user);
              await fetchUserProfile(session.user.id);
            } catch (validationError) {
              console.error('Error validating user:', validationError);
              await supabase.auth.signOut();
              clearAllCachedData();
              setSession(null);
              setUser(null);
            }
          } else {
            setSession(null);
            setUser(null);
            setProfileError(false);
            setSubscriptionStatus(null);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          clearAllCachedData();
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

      if (event === 'SIGNED_OUT' || !session) {
        console.log('User signed out or session ended');
        setSession(null);
        setUser(null);
        setSubscriptionStatus(null);
        setProfileError(false);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' && session?.user?.id) {
        console.log('User signed in:', session.user.email);
        
        // Validate the user exists before setting session
        try {
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();
          
          if (profileError || !data) {
            console.log('Signed in user has no profile - invalid session');
            await supabase.auth.signOut();
            clearAllCachedData();
            toast.error('Account not found. Please create a new account.');
            return;
          }
          
          setSession(session);
          setUser(session.user);
          await fetchUserProfile(session.user.id);
          
          // Check for pending session verification after login
          const pendingSessionId = localStorage.getItem('pending_session_id');
          if (pendingSessionId && location.pathname !== '/thank-you') {
            console.log('Found pending session after login, redirecting to thank-you page');
            navigate(`/thank-you?session_id=${pendingSessionId}`);
          }
        } catch (validationError) {
          console.error('Error validating signed in user:', validationError);
          await supabase.auth.signOut();
          clearAllCachedData();
          toast.error('Unable to verify account. Please try again.');
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user?.id) {
        console.log('Token refreshed for user:', session.user.email);
        // Verify the user still exists when token is refreshed
        await fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
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
