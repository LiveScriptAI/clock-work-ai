
import React from "react";
import { Navigate, Link } from "react-router-dom";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import FeaturesGrid from "@/components/FeaturesGrid";
import { useAuth } from "@/contexts/AuthContext";
import ExperienceSection from "@/components/welcome/ExperienceSection";
import CallToActionSection from "@/components/welcome/CallToActionSection";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const WelcomePage = () => {
  const { user, isLoading, isEmailVerified, isInitialized } = useAuth();
  
  // While auth state loads, show a loading placeholder
  if (!isInitialized || isLoading) {
    return <div>Loading...</div>;
  }

  // Already fully authenticated? Jump straight to dashboard
  if (user && isEmailVerified) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };
  
  const floatAnimation = {
    y: [-10, 10, -10],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  };
  
  return (
    <div className="font-body w-full min-h-screen">
      {/* Hero Section */}
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
          <motion.p variants={itemVariants} className="font-body max-w-4xl text-white/90 text-center mb-12 text-lg md:text-xl mx-auto">
            Clock Work Pal is a simple web app for workers, freelancers and contractors. Track your shifts, breaks and earnings in real time. Generate professional invoices and share timesheets in seconds.
          </motion.p>

          {/* CTAs */}
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={itemVariants}>
            <Button 
              asChild 
              size="lg" 
              className="px-8 py-4 bg-brand-accent text-brand-navy font-semibold rounded-full shadow-lg text-lg hover:opacity-90 transition hover:scale-105 transform duration-200"
            >
              <Link to="/register">Get Started</Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 border-2 border-white text-white font-medium rounded-full text-lg hover:bg-white hover:text-brand-navy transition"
            >
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <FeaturesGrid />

      {/* Experience Section */}
      <ExperienceSection
        containerVariants={containerVariants}
        itemVariants={itemVariants}
        imageVariants={imageVariants}
        floatAnimation={floatAnimation}
      />

      {/* Testimonials Section */}
      <TestimonialsCarousel />

      {/* CTA Section */}
      <CallToActionSection
        containerVariants={containerVariants}
        itemVariants={itemVariants}
        isAccountVerified={false}
      />
    </div>
  );
};

export default WelcomePage;
