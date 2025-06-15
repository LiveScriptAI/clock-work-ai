import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import FeaturesGrid from "@/components/FeaturesGrid";
import { AuthenticatedCheckoutButton } from "@/components/AuthenticatedCheckoutButton";
import { useAuth } from "@/contexts/AuthContext";

const WelcomePage = () => {
  const { user, isSubscribed, isLoading, isEmailVerified } = useAuth();
  
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
  const isFullyReady = isAccountVerified && !isSubscribed;

  console.log('Welcome page state:', {
    isLoading,
    hasAccount,
    isEmailVerified,
    isAccountVerified,
    isSubscribed,
    isFullyReady
  });

  const getStepOneStatus = () => {
    if (isLoading) return { text: "Create your account", complete: false, loading: true };
    if (!hasAccount) return { text: "Create your account", complete: false, loading: false };
    if (!isEmailVerified) return { text: "Verify your email", complete: false, loading: false };
    return { text: "Account verified ✓", complete: true, loading: false };
  };

  const getStepTwoContent = () => {
    if (isLoading) {
      return {
        text: "Loading...",
        component: (
          <Button disabled size="lg" className="px-12 py-4 text-lg bg-gray-300 text-gray-500 rounded-full">
            Loading...
          </Button>
        )
      };
    }

    if (!hasAccount) {
      return {
        text: "First, create your account above",
        component: (
          <Button disabled size="lg" className="px-12 py-4 text-lg bg-gray-300 text-gray-500 rounded-full">
            Create Account First
          </Button>
        )
      };
    }

    if (!isEmailVerified) {
      return {
        text: "Please verify your email first",
        component: (
          <Button disabled size="lg" className="px-12 py-4 text-lg bg-gray-300 text-gray-500 rounded-full">
            Verify Email First
          </Button>
        )
      };
    }

    if (isSubscribed) {
      return {
        text: "Access your dashboard",
        component: (
          <Button asChild size="lg" className="px-12 py-4 bg-brand-accent text-brand-navy font-bold rounded-full shadow-xl hover:opacity-90 transition text-lg hover:scale-105 transform duration-200">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        )
      };
    }

    return {
      text: "Start your 7-day free trial",
      component: <AuthenticatedCheckoutButton className="px-12 py-4 text-lg" />
    };
  };

  const stepOneStatus = getStepOneStatus();
  const stepTwoContent = getStepTwoContent();
  
  return (
    <div className="font-body">
      {/* Hero Section */}
      <motion.section 
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6" 
        initial="hidden" 
        animate="visible" 
        variants={containerVariants}
      >
        {/* Logo */}
        <motion.div className="mb-8" variants={itemVariants}>
          <img 
            src="/lovable-uploads/5e5ad164-5fad-4fa8-8d19-cbccf2382c0e.png" 
            alt="Clock Work Pal logo" 
            className="w-64 h-auto mx-auto" 
          />
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={itemVariants} className="font-display md:text-6xl text-white mb-4 text-center text-5xl">
          Smarter Time Tracking
        </motion.h1>

        {/* Subtext */}
        <motion.p variants={itemVariants} className="font-body max-w-2xl text-white/90 text-center mb-8 text-lg md:text-lg">
          Clock Work Pal is a simple web app for workers, freelancers and contractors. Track your shifts, breaks and earnings in real time. Generate professional invoices and share timesheets in seconds.
        </motion.p>

        {/* Get Started Instructions */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <h3 className="font-display text-white mb-4 text-3xl">Get started in 2 simple steps:</h3>
        </motion.div>

        {/* Step 1: Create Account / Verify Email */}
        <motion.div className="flex flex-col items-center mb-6" variants={itemVariants}>
          <div className="flex items-center mb-3">
            <span className={`${stepOneStatus.complete ? 'bg-green-500' : 'bg-brand-accent'} text-brand-navy font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg`}>
              {stepOneStatus.complete ? '✓' : '1'}
            </span>
            <span className="font-body text-lg text-white">
              {stepOneStatus.text}
            </span>
          </div>
          
          {!stepOneStatus.complete && !stepOneStatus.loading && (
            <div className="flex gap-3">
              {!hasAccount ? (
                <Button 
                  asChild 
                  size="lg" 
                  className="px-12 py-4 bg-brand-accent text-brand-navy font-bold rounded-full shadow-xl hover:opacity-90 transition text-lg hover:scale-105 transform duration-200"
                >
                  <Link to="/register">Create Account</Link>
                </Button>
              ) : (
                <Button 
                  asChild 
                  size="lg" 
                  className="px-12 py-4 bg-brand-accent text-brand-navy font-bold rounded-full shadow-xl hover:opacity-90 transition text-lg hover:scale-105 transform duration-200"
                >
                  <Link to="/email-verification">Check Email for Verification</Link>
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {/* Step 2: Start Trial */}
        <motion.div className="flex flex-col items-center" variants={itemVariants}>
          <div className="flex items-center mb-3">
            <span className={`${isSubscribed ? 'bg-green-500' : 'bg-brand-accent'} text-brand-navy font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg`}>
              {isSubscribed ? '✓' : '2'}
            </span>
            <span className="font-body text-lg text-white">{stepTwoContent.text}</span>
          </div>
          <div className="flex justify-center px-0 mx-0 my-[20px] py-0">
            {stepTwoContent.component}
          </div>
        </motion.div>

        {/* Status Messages */}
        {!isLoading && !hasAccount && (
          <motion.p className="font-body text-sm text-white/80 text-center max-w-md mt-4" variants={itemVariants}>
            ⚠️ Please create your account first to ensure your subscription and activity data are properly saved.
          </motion.p>
        )}

        {!isLoading && hasAccount && !isEmailVerified && (
          <motion.p className="font-body text-sm text-white/80 text-center max-w-md mt-4" variants={itemVariants}>
            📧 Please check your email and click the verification link to complete your account setup.
          </motion.p>
        )}
      </motion.section>

      {/* Features Section */}
      <FeaturesGrid />

      {/* Redesigned Unlock Your Full Potential Section */}
      <motion.section className="bg-gradient-to-r from-purple-600 to-blue-600 py-16 px-6 text-white overflow-hidden" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}>
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <motion.div className="mb-6" variants={itemVariants}>
              <span className="text-5xl">💎</span>
            </motion.div>
            <motion.h3 className="font-display text-4xl md:text-5xl mb-4" variants={itemVariants}>
              Experience Professional Time Tracking
            </motion.h3>
            <motion.p className="font-body text-xl md:text-2xl mb-2 max-w-4xl mx-auto opacity-90" variants={itemVariants}>
              See how Clock Work Pal transforms your workflow with intuitive time tracking, comprehensive reporting, and seamless invoicing.
            </motion.p>
            <motion.p className="font-body text-lg mb-8 max-w-3xl mx-auto opacity-80" variants={itemVariants}>
              Join thousands of professionals who trust our platform for accurate time management and effortless billing.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto">
            <motion.div className="flex justify-center" variants={imageVariants} animate={floatAnimation}>
              <img src="/lovable-uploads/be6a480e-c261-40ac-9ace-e638a2edc3e2.png" alt="Manager Approval Interface" className="w-full max-w-[280px] h-auto rounded-lg shadow-2xl hover:shadow-3xl transition-shadow duration-300" />
            </motion.div>
            <motion.div className="flex justify-center" variants={imageVariants} animate={{ ...floatAnimation, transition: { ...floatAnimation.transition, delay: 0.5 } }}>
              <img src="/lovable-uploads/9a4bacff-ec7d-458d-bb51-176f8a992a22.png" alt="Time Tracking Dashboard" className="w-full max-w-[280px] h-auto rounded-lg shadow-2xl hover:shadow-3xl transition-shadow duration-300" />
            </motion.div>
            <motion.div className="flex justify-center" variants={imageVariants} animate={{ ...floatAnimation, transition: { ...floatAnimation.transition, delay: 1 } }}>
              <img src="/lovable-uploads/706a04d3-6a1e-4abd-afe8-d61ad2d8f20c.png" alt="Timesheet Log and Reports" className="w-full max-w-[280px] h-auto rounded-lg shadow-2xl hover:shadow-3xl transition-shadow duration-300" />
            </motion.div>
          </div>

          <motion.div className="text-center" variants={itemVariants}>
            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center" variants={itemVariants}>
              <div className="flex items-center gap-2 opacity-70">
                <span className="text-sm">No credit card required</span>
                <span className="text-xs">•</span>
                <span className="text-sm">Cancel anytime</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <TestimonialsCarousel />

      {/* CTA Section */}
      <motion.section 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true }} 
        variants={containerVariants} 
        className="py-12 px-6 text-center bg-[#cfeaff]"
      >
        <motion.div variants={itemVariants}>
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
    </div>
  );
};

export default WelcomePage;
