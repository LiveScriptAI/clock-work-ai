
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DomainGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hostname = window.location.hostname;
    const isPublicDomain = hostname === 'clockworkpal.com' || hostname === 'www.clockworkpal.com' || hostname === 'support.clockworkpal.com';
    const isAppEnvironment = !isPublicDomain; // Localhost, Lovable domains, mobile app, etc.
    
    if (isPublicDomain) {
      // On public domain - only allow public pages, redirect app routes to landing
      const isAppRoute = location.pathname.startsWith('/app') || location.pathname.startsWith('/dashboard');
      if (isAppRoute) {
        navigate('/', { replace: true });
      }
    } else if (isAppEnvironment) {
      // In app environment - redirect landing page to dashboard
      const isPublicRoute = location.pathname === '/' || location.pathname === '/privacy-policy' || location.pathname === '/support';
      if (location.pathname === '/') {
        navigate('/dashboard', { replace: true });
      }
      // Remove legacy /app route redirect
      if (location.pathname === '/app') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
};

export default DomainGuard;
