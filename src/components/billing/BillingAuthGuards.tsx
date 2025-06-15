
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function BillingAuthGuards() {
  const { isInitialized, isLoading: authLoading, user, isEmailVerified } = useAuth();

  // Auth guards - must come first
  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-navy" />
      </div>
    );
  }

  // Must be logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Must have verified email
  if (!isEmailVerified) {
    return <Navigate to="/email-verification" replace />;
  }

  return null;
}
