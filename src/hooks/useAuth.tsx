
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
  // Mock user for dashboard functionality - no auth needed in native container
  const [user, setUser] = useState<any>({
    id: 'mock-user-id',
    email: 'user@clockworkpal.com',
    user_metadata: { full_name: 'Clock Work Pal User' }
  });
  const [profile, setProfile] = useState<ProfileType | null>(null);

  useEffect(() => {
    // Set mock user immediately
    setUser({
      id: 'mock-user-id',
      email: 'user@clockworkpal.com',
      user_metadata: { full_name: 'Clock Work Pal User' }
    });
  }, []);

  // No sign-out needed for native container
  const handleSignOut = async () => {
    console.log("Sign out not needed in native container");
  };

  return { user, profile, handleSignOut };
}
