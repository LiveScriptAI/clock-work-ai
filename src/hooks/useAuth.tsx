
import { useState, useEffect } from "react";

export type ProfileType = {
  address1?: string;
  address2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
};

export function useAuth() {
  // Mock user for dashboard functionality
  const [user, setUser] = useState<any>({
    id: 'mock-user-id',
    email: 'demo@example.com',
    user_metadata: { full_name: 'Demo User' }
  });
  const [profile, setProfile] = useState<ProfileType | null>(null);

  useEffect(() => {
    // Set mock user immediately
    setUser({
      id: 'mock-user-id',
      email: 'demo@example.com',
      user_metadata: { full_name: 'Demo User' }
    });
  }, []);

  const handleSignOut = async () => {
    console.log("Sign out clicked - but no authentication system active");
    // No actual sign out since we removed authentication
  };

  return { user, profile, handleSignOut };
}
