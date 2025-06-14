import React from "react";
import { Link } from "react-router-dom"; // Keep Link for potential future use
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import StripeCheckoutButton from "@/components/StripeCheckoutButton";
// Removed useAuth import

const FinalCTASection = () => {
  // Removed user, isSubscribed, profileError, handleSignOut from useAuth()

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

  // Defaulting to "user not logged in" state as auth is removed.
  // Links to /register and /login are removed or replaced.
  const renderFinalCTA = () => {
    return (
      <div className="text-center">
        <h3 className="font-display text-3xl text-brand-navy mb-4">
          Ready to Get Started?
        </h3>
        <p className="font-body text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
          Join thousands of workers, freelancers, and contractors who trust Clock Work Pal for their time tracking needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Using StripeCheckoutButton directly for "Start Free Trial" */}
          <StripeCheckoutButton className="px-8 py-4 bg-brand-accent text-brand-navy font-semibold rounded-full shadow-lg hover:opacity-90 transition text-lg" />
          
          {/* Removed "Login" button as /login page is gone */}
          {/* 
          <Button asChild className="px-8 py-4 bg-white text-brand-navy font-medium rounded-full hover:bg-white/90 transition text-lg shadow-lg border-2 border-brand-navy">
            <Link to="/welcome">Placeholder Link</Link> // Changed from /login
          </Button> 
          */}
        </div>
      </div>
    );
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
