import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StripeCheckoutButton from "@/components/StripeCheckoutButton";
import { useAuth } from "@/hooks/useAuth";

const CTAButtons = () => {
  const { user, subscriptionStatus, isSubscribed, profileError, handleSignOut } = useAuth();

  // Handle profile error case
  if (user && profileError) {
    return (
      <div className="text-center">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-md mx-auto mb-6">
          <h3 className="font-display text-white mb-2 text-xl">Account Setup Issue</h3>
          <p className="text-white/90 text-base mb-4">There was an issue with your account setup. Please log out and create a new account to continue.</p>
          <Button onClick={handleSignOut} variant="outline" className="w-full border-red-500 text-red-700 hover:bg-red-50">
            Log Out & Start Fresh
          </Button>
        </div>
      </div>
    );
  }

  if (user) {
    if (isSubscribed) {
      // User is logged in and subscribed
      return (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-md mx-auto mb-6">
            <h3 className="font-display text-white mb-2 text-xl">Welcome back! 👋</h3>
            <p className="text-white/90 text-base mb-4">You have an active subscription. Ready to track some time?</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="px-12 py-4 bg-brand-accent text-brand-navy font-bold rounded-full shadow-xl hover:opacity-90 transition text-lg hover:scale-105 transform duration-200">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      );
    } else {
      // User is logged in but not subscribed (and no profile error)
      const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there';
      
      return (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-md mx-auto mb-6">
            <h3 className="font-display text-white mb-2 text-xl">Welcome back, {firstName}! 👋</h3>
            <p className="text-white/90 text-base mb-4">You're logged in, but you haven't started your trial yet. Click below to unlock full access to Clock Work Pal.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <StripeCheckoutButton className="px-12 py-4 bg-brand-accent text-brand-navy font-bold rounded-full shadow-xl hover:opacity-90 transition text-lg hover:scale-105 transform duration-200" />
          </div>
        </div>
      );
    }
  } else {
    // User is not logged in
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="px-12 py-4 bg-brand-accent text-brand-navy font-bold rounded-full shadow-xl hover:opacity-90 transition text-lg hover:scale-105 transform duration-200">
          <Link to="/register">Start Free Trial</Link>
        </Button>
        <Button asChild className="px-8 py-4 bg-white text-brand-navy font-medium rounded-full hover:bg-white/90 transition text-lg shadow-xl border-2 border-white">
          <Link to="/login">Login</Link>
        </Button>
      </div>
    );
  }
};

export default CTAButtons;
