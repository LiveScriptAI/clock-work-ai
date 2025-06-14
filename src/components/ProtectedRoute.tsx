
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export function ProtectedRoute({ children, requireSubscription = true }: ProtectedRouteProps) {
  const { user, isSubscribed, isLoading } = useAuth();

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-navy" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If authentication is required but no subscription, redirect to subscription required
  if (requireSubscription && !isSubscribed) {
    return <Navigate to="/subscription-required" replace />;
  }

  return <>{children}</>;
}
