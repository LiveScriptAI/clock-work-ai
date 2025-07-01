
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DomainGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hostname = window.location.hostname;
    const isMainDomain = hostname === 'clockworkpal.com' || hostname === 'www.clockworkpal.com' || hostname === 'support.clockworkpal.com';
    const isAppRoute = location.pathname.startsWith('/app') || location.pathname.startsWith('/dashboard');

    // If user is on main domain and trying to access app routes, redirect to landing page
    if (isMainDomain && isAppRoute) {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
};

export default DomainGuard;
