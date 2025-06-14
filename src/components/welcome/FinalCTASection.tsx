
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import StripeCheckoutButton from "@/components/StripeCheckoutButton";
import { useAuth } from "@/hooks/useAuth";

const FinalCTASection = () => {
  const { user, isSubscribed, profileError, handleSignOut } = useAuth();

  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const renderFinalCTA = () => {
    // Handle profile error case
    if (user && profileError) {
      return (
        <div className="text-center">
          <h3 className="font-display text-3xl text-brand-navy mb-4">
            Account Setup Issue
          </h3>
          <p className="font-body text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            We detected an issue with your account. Please log out and create a new account to continue.
          </p>
          <Button onClick={handleSignOut} variant="outline" className="px-8 py-4 border-2 border-brand-navy text-brand-navy font-medium rounded-full hover:bg-brand-navy hover:text-white transition text-lg">
            Log Out & Start Fresh
          </Button>
        </div>
      );
    }

    if (user && !isSubscribed) {
      const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there';
      
      return (
        <div className="text-center">
          <h3 className="font-display text-3xl text-brand-navy mb-4">
            Ready to Start Your Trial, {firstName}?
          </h3>
          <p className="font-body text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            You're logged in! Start your 7-day free trial to unlock all features and join thousands of professionals who trust Clock Work Pal.
          </p>
          <StripeCheckoutButton className="px-8 py-4 bg-brand-accent text-brand-navy font-semibold rounded-full shadow-lg hover:opacity-90 transition text-lg" />
        </div>
      );
    } else if (user && isSubscribed) {
      const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there';
      
      return (
        <div className="text-center">
          <h3 className="font-display text-3xl text-brand-navy mb-4">
            Welcome Back, {firstName}!
          </h3>
          <p className="font-body text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            You're all set with an active subscription. Access your dashboard to start tracking time.
          </p>
          <Button asChild className="px-8 py-4 bg-brand-accent text-brand-navy font-semibold rounded-full shadow-lg hover:opacity-90 transition text-lg">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      );
    } else {
      return (
        <div className="text-center">
          <h3 className="font-display text-3xl text-brand-navy mb-4">
            Ready to Get Started?
          </h3>
          <p className="font-body text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Join thousands of workers, freelancers, and contractors who trust Clock Work Pal for their time tracking needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="px-8 py-4 bg-brand-accent text-brand-navy font-semibold rounded-full shadow-lg hover:opacity-90 transition text-lg">
              <Link to="/register">Start Free Trial</Link>
            </Button>
            <Button asChild className="px-8 py-4 bg-white text-brand-navy font-medium rounded-full hover:bg-white/90 transition text-lg shadow-lg border-2 border-brand-navy">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <motion.section 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true }} 
      variants={containerVariants} 
      className="py-12 px-6 text-center bg-[#cfeaff]"
    >
      <motion.div variants={itemVariants}>
        {renderFinalCTA()}
      </motion.div>
    </motion.section>
  );
};

export default FinalCTASection;
