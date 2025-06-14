import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import FeaturesGrid from "@/components/FeaturesGrid";
import StripeCheckoutButton from "@/components/StripeCheckoutButton";
import { useAuth } from "@/hooks/useAuth";

const WelcomePage = () => {
  const { user, subscriptionStatus, isSubscribed, profileError, handleSignOut } = useAuth();
  
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
  
  const imageVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };
  
  const floatAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const renderCTAButtons = () => {
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

  return <div className="font-body">
      {/* Hero Section */}
      <motion.section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6" initial="hidden" animate="visible" variants={containerVariants}>
        {/* Logo */}
        <motion.div className="mb-8" variants={itemVariants}>
          <img src="/lovable-uploads/5e5ad164-5fad-4fa8-8d19-cbccf2382c0e.png" alt="Clock Work Pal logo" className="w-64 h-auto mx-auto" />
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={itemVariants} className="font-display md:text-6xl text-white mb-4 text-center text-5xl">
          Smarter Time Tracking
        </motion.h1>

        {/* Subtext */}
        <motion.p variants={itemVariants} className="font-body max-w-2xl text-white/90 text-center mb-8 text-lg md:text-lg">Clock Work Pal is a simple web app for workers, freelancers and contractors. Track your shifts, breaks and earnings in real time. Generate professional invoices and share timesheets in seconds.</motion.p>

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
          {renderCTAButtons()}
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <FeaturesGrid />

      {/* App Preview Section */}
      <motion.section className="bg-gradient-to-r from-purple-600 to-blue-600 py-16 px-6 text-white overflow-hidden" initial="hidden" whileInView="visible" viewport={{
      once: true
    }} variants={containerVariants}>
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

          {/* App Screenshots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto">
            <motion.div className="flex justify-center" variants={imageVariants} animate={floatAnimation}>
              <img src="/lovable-uploads/be6a480e-c261-40ac-9ace-e638a2edc3e2.png" alt="Manager Approval Interface" className="w-full max-w-[280px] h-auto rounded-lg shadow-2xl hover:shadow-3xl transition-shadow duration-300" />
            </motion.div>

            <motion.div className="flex justify-center" variants={imageVariants} animate={{
            ...floatAnimation,
            transition: {
              ...floatAnimation.transition,
              delay: 0.5
            }
          }}>
              <img src="/lovable-uploads/9a4bacff-ec7d-458d-bb51-176f8a992a22.png" alt="Time Tracking Dashboard" className="w-full max-w-[280px] h-auto rounded-lg shadow-2xl hover:shadow-3xl transition-shadow duration-300" />
            </motion.div>

            <motion.div className="flex justify-center" variants={imageVariants} animate={{
            ...floatAnimation,
            transition: {
              ...floatAnimation.transition,
              delay: 1
            }
          }}>
              <img src="/lovable-uploads/706a04d3-6a1e-4abd-afe8-d61ad2d8f20c.png" alt="Timesheet Log and Reports" className="w-full max-w-[280px] h-auto rounded-lg shadow-2xl hover:shadow-3xl transition-shadow duration-300" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <TestimonialsCarousel />

      {/* Final CTA Section */}
      <motion.section initial="hidden" whileInView="visible" viewport={{
      once: true
    }} variants={containerVariants} className="py-12 px-6 text-center bg-[#cfeaff]">
        <motion.div variants={itemVariants}>
          {renderFinalCTA()}
        </motion.div>
      </motion.section>
    </div>;
};

export default WelcomePage;
