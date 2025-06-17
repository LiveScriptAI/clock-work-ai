
import React from "react";
import { Navigate } from "react-router-dom";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import FeaturesGrid from "@/components/FeaturesGrid";
import { useAuth } from "@/contexts/AuthContext";
import WelcomeHero from "@/components/welcome/WelcomeHero";
import GetStartedSteps from "@/components/welcome/GetStartedSteps";
import ExperienceSection from "@/components/welcome/ExperienceSection";
import CallToActionSection from "@/components/welcome/CallToActionSection";

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

  // Determine user state more accurately
  const hasAccount = !isLoading && !!user;
  const isAccountVerified = hasAccount && isEmailVerified;

  console.log('Welcome page state:', {
    isLoading,
    hasAccount,
    isEmailVerified,
    isAccountVerified
  });
  
  return (
    <div className="font-body w-full min-h-screen">
      {/* Hero Section with Steps */}
      <WelcomeHero 
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />
      
      {/* Get Started Steps - now part of the hero section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 lg:px-8 pb-16">
        <div className="w-full max-w-6xl mx-auto text-center">
          <GetStartedSteps
            itemVariants={itemVariants}
            isLoading={isLoading}
            hasAccount={hasAccount}
            isEmailVerified={isEmailVerified}
          />
        </div>
      </div>

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
        isAccountVerified={isAccountVerified}
      />
    </div>
  );
};

export default WelcomePage;
