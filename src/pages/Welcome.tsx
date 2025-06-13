
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import FeaturesGrid from "@/components/FeaturesGrid";

const WelcomePage = () => {
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

        {/* Get Started Instructions */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <h3 className="font-display text-white mb-4 text-3xl">Get started in 2 simple steps:</h3>
        </motion.div>

        {/* Step 1: Create Account */}
        <motion.div className="flex flex-col items-center mb-6" variants={itemVariants}>
          <div className="flex items-center mb-3">
            <span className="bg-brand-accent text-brand-navy font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg">1</span>
            <span className="font-body text-lg text-white">Create your account</span>
          </div>
          <Button asChild size="lg" className="px-12 py-4 bg-brand-accent text-brand-navy font-bold rounded-full shadow-xl hover:opacity-90 transition text-lg hover:scale-105 transform duration-200">
            <Link to="/register">Create Account</Link>
          </Button>
        </motion.div>

        {/* Step 2: Sign In */}
        <motion.div className="flex flex-col items-center" variants={itemVariants}>
          <div className="flex items-center mb-3">
            <span className="bg-brand-accent text-brand-navy font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg">2</span>
            <span className="font-body text-lg text-white">Sign in to start tracking</span>
          </div>
          <Button asChild size="lg" className="px-12 py-4 bg-brand-accent text-brand-navy font-bold rounded-full shadow-xl hover:opacity-90 transition text-lg hover:scale-105 transform duration-200">
            <Link to="/login">Sign In</Link>
          </Button>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <FeaturesGrid />

      {/* Redesigned App Preview Section */}
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

          {/* App Screenshots Grid - 3 images evenly spaced */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto">
            {/* Manager Approval Dialog */}
            <motion.div className="flex justify-center" variants={imageVariants} animate={floatAnimation}>
              <img src="/lovable-uploads/be6a480e-c261-40ac-9ace-e638a2edc3e2.png" alt="Manager Approval Interface" className="w-full max-w-[280px] h-auto rounded-lg shadow-2xl hover:shadow-3xl transition-shadow duration-300" />
            </motion.div>

            {/* Time Tracking Interface */}
            <motion.div className="flex justify-center" variants={imageVariants} animate={{
            ...floatAnimation,
            transition: {
              ...floatAnimation.transition,
              delay: 0.5
            }
          }}>
              <img src="/lovable-uploads/9a4bacff-ec7d-458d-bb51-176f8a992a22.png" alt="Time Tracking Dashboard" className="w-full max-w-[280px] h-auto rounded-lg shadow-2xl hover:shadow-3xl transition-shadow duration-300" />
            </motion.div>

            {/* Timesheet Log */}
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

      {/* CTA Section */}
      <motion.section initial="hidden" whileInView="visible" viewport={{
      once: true
    }} variants={containerVariants} className="py-12 px-6 text-center bg-[#cfeaff]">
        <motion.div variants={itemVariants}>
          <h3 className="font-display text-3xl text-brand-navy mb-4">
            Ready to Get Started?
          </h3>
          <p className="font-body text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Join thousands of workers, freelancers, and contractors who trust Clock Work Pal for their time tracking needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="px-8 py-4 bg-brand-accent text-brand-navy font-semibold rounded-full shadow-lg hover:opacity-90 transition text-lg">
              <Link to="/register">Create Account</Link>
            </Button>
            <Button asChild variant="outline" className="px-8 py-4 border-2 border-brand-navy text-brand-navy font-medium rounded-full hover:bg-brand-navy hover:text-white transition text-lg">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </motion.div>
      </motion.section>
    </div>;
};

export default WelcomePage;
