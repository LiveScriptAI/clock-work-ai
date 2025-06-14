
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export function ProtectedRoute({ children, requireSubscription = false }: ProtectedRouteProps) {
  const { user, loading, subscriptionStatus, profileError } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute check:', { 
    user: user?.email, 
    loading, 
    subscriptionStatus, 
    requireSubscription,
    profileError,
    currentPath: location.pathname 
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-navy"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has profile error, redirect to welcome for cleanup
  if (profileError) {
    console.log('Profile error detected, redirecting to welcome for cleanup');
    return <Navigate to="/welcome" replace />;
  }

  // If subscription is required, check if user has active subscription
  if (requireSubscription) {
    console.log('Subscription required - checking status:', subscriptionStatus);
    if (subscriptionStatus !== 'active') {
      console.log('User does not have active subscription, redirecting to welcome');
      return <Navigate to="/welcome" replace />;
    }
  }

  console.log('Access granted to protected route');
  return <>{children}</>;
}
