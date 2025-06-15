
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AuthenticatedCheckoutButton } from "@/components/AuthenticatedCheckoutButton";

interface CallToActionSectionProps {
  containerVariants: any;
  itemVariants: any;
  isAccountVerified: boolean;
}

const CallToActionSection = ({ 
  containerVariants, 
  itemVariants, 
  isAccountVerified 
}: CallToActionSectionProps) => {
  return (
    <motion.section 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true }} 
      variants={containerVariants} 
      className="py-12 px-4 sm:px-6 lg:px-8 text-center bg-[#cfeaff] w-full"
    >
      <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
        <h3 className="font-display text-3xl text-brand-navy mb-4">
          Ready to Get Started?
        </h3>
        <p className="font-body text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
          Join thousands of workers, freelancers, and contractors who trust Clock Work Pal for their time tracking needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isAccountVerified ? (
            <>
              <Button 
                asChild 
                className="px-8 py-4 bg-brand-accent text-brand-navy font-semibold rounded-full shadow-lg hover:opacity-90 transition text-lg"
              >
                <Link to="/register">Create Account</Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="px-8 py-4 border-2 border-brand-navy text-brand-navy font-medium rounded-full hover:bg-brand-navy hover:text-white transition text-lg"
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </>
          ) : (
            <AuthenticatedCheckoutButton className="px-8 py-4 text-lg" />
          )}
        </div>
      </motion.div>
    </motion.section>
  );
};

export default CallToActionSection;
