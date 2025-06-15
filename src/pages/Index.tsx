
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to welcome page immediately
    navigate('/welcome', { replace: true });
  }, [navigate]);

  // Show nothing while redirecting
  return null;
};

export default Index;
