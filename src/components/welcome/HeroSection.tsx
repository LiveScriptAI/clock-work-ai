
import React from "react";
import { motion } from "framer-motion";
import CTAButtons from "./CTAButtons";

const HeroSection = () => {
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

  return (
    <motion.section 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6" 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
    >
      {/* Logo */}
      <motion.div className="mb-8" variants={itemVariants}>
        <img src="/lovable-uploads/5e5ad164-5fad-4fa8-8d19-cbccf2382c0e.png" alt="Clock Work Pal logo" className="w-64 h-auto mx-auto" />
      </motion.div>

      {/* Headline */}
      <motion.h1 variants={itemVariants} className="font-display md:text-6xl text-white mb-4 text-center text-5xl">
        Smarter Time Tracking
      </motion.h1>

      {/* Subtext */}
      <motion.p variants={itemVariants} className="font-body max-w-2xl text-white/90 text-center mb-8 text-lg md:text-lg">
        Clock Work Pal is a simple web app for workers, freelancers and contractors. Track your shifts, breaks and earnings in real time. Generate professional invoices and share timesheets in seconds.
      </motion.p>

      {/* Pricing highlight */}
      <motion.div className="text-center mb-8" variants={itemVariants}>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-md mx-auto">
          <h3 className="font-display text-white mb-2 text-2xl">7-Day Free Trial</h3>
          <p className="text-white/90 text-lg mb-4">Then just £3.99/month</p>
          <div className="text-sm text-white/80">
            <p>✓ Unlimited time tracking</p>
            <p>✓ Professional invoicing</p>
            <p>✓ Export timesheets</p>
            <p>✓ Cancel anytime</p>
          </div>
        </div>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div variants={itemVariants}>
        <CTAButtons />
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
