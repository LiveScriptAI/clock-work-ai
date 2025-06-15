
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileType } from "@/types/auth";

export function useProfile() {
  const [profile, setProfile] = useState<ProfileType | null>(null);

  const fetchUserProfile = async (userId: string) => {
    console.log("📊 Fetching user profile for:", userId);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("address1, address2, city, county, postcode, country, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_tier")
        .eq("id", userId)
        .maybeSingle();
      
      if (error) {
        console.error("❌ Profile fetch error:", error);
        return;
      }
      
      console.log("✅ Profile fetched:", { 
        hasProfile: !!data,
        subscriptionStatus: data?.subscription_status,
        subscriptionTier: data?.subscription_tier,
        hasStripeCustomer: !!data?.stripe_customer_id
      });
      
      setProfile(data);
    } catch (error) {
      console.error("💥 Unexpected profile fetch error:", error);
    }
  };

  const refreshProfile = (userId: string | undefined) => {
    if (userId) {
      fetchUserProfile(userId);
    }
  };

  const refreshSubscriptionStatus = async (userId: string | undefined) => {
    console.log("🔄 Refreshing subscription status...");
    if (userId) {
      await fetchUserProfile(userId);
    }
  };

  return {
    profile,
    setProfile,
    fetchUserProfile,
    refreshProfile,
    refreshSubscriptionStatus
  };
}
