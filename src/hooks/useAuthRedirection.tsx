
import { useNavigate, useLocation } from "react-router-dom";
import { ProfileType, AuthUser } from "@/types/auth";

export function useAuthRedirection() {
  const navigate = useNavigate();
  const location = useLocation();

  const checkSubscriptionAndRedirect = (user: AuthUser | null, profile: ProfileType | null) => {
    console.log("🧭 Checking subscription and redirect logic", {
      currentPath: location.pathname,
      subscriptionStatus: profile?.subscription_status,
      hasStripeCustomer: !!profile?.stripe_customer_id
    });
    
    // Don't redirect if on public pages or subscription-related pages
    const publicPages = ['/welcome', '/register', '/login', '/email-verification', '/subscription-required', '/billing'];
    if (publicPages.includes(location.pathname)) {
      console.log("📍 On public page, skipping redirect");
      return;
    }

    // Check for users with incomplete payments - they have a stripe_customer_id but no active subscription
    const hasIncompletePayment = profile?.stripe_customer_id && profile?.subscription_status !== 'active';
    
    if (user && hasIncompletePayment) {
      // User started checkout but didn't complete - send to billing page to continue
      console.log("💳 User has incomplete payment, redirecting to billing");
      navigate('/billing');
    } else if (user && !profile?.subscription_status) {
      // User is authenticated but has no subscription attempt yet - redirect to subscription required
      console.log("🚫 User has no subscription, redirecting to subscription required");
      navigate('/subscription-required');
    } else if (user && profile?.subscription_status === 'active' && location.pathname === '/subscription-required') {
      // If user has subscription but is on subscription required page, redirect to dashboard
      console.log("✅ User has active subscription, redirecting to dashboard");
      navigate('/dashboard');
    }
  };

  const handleUnauthenticatedRedirect = () => {
    // Only redirect to login if not on public pages
    if (!['/welcome', '/register', '/login', '/email-verification'].includes(location.pathname)) {
      navigate("/login");
    }
  };

  return {
    checkSubscriptionAndRedirect,
    handleUnauthenticatedRedirect
  };
}
