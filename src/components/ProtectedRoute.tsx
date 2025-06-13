
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export function ProtectedRoute({ children, requireSubscription = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-navy"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For now, we're not enforcing subscription requirements
  // This will be re-implemented in future phases
  return <>{children}</>;
}
