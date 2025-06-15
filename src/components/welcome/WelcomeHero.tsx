
import React from "react";
import { motion } from "framer-motion";

interface WelcomeHeroProps {
  containerVariants: any;
  itemVariants: any;
}

const WelcomeHero = ({ containerVariants, itemVariants }: WelcomeHeroProps) => {
  return (
    <motion.section 
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 lg:px-8" 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
    >
      <div className="w-full max-w-6xl mx-auto text-center">
        {/* Logo */}
        <motion.div className="mb-8" variants={itemVariants}>
          <img 
            src="/lovable-uploads/5e5ad164-5fad-4fa8-8d19-cbccf2382c0e.png" 
            alt="Clock Work Pal logo" 
            className="w-64 h-auto mx-auto" 
          />
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={itemVariants} className="font-display text-4xl sm:text-5xl md:text-6xl text-white mb-4 text-center">
          Smarter Time Tracking
        </motion.h1>

        {/* Subtext */}
        <motion.p variants={itemVariants} className="font-body max-w-4xl text-white/90 text-center mb-8 text-lg md:text-xl mx-auto">
          Clock Work Pal is a simple web app for workers, freelancers and contractors. Track your shifts, breaks and earnings in real time. Generate professional invoices and share timesheets in seconds.
        </motion.p>
      </div>
    </motion.section>
  );
};

export default WelcomeHero;
