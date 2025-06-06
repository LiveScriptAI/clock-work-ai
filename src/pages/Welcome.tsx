import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
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
  const features = [{
    icon: "⌚",
    title: "Live Time Tracking",
    description: "Start and end shifts and breaks in real time. Your time keeps counting even if you reload the app."
  }, {
    icon: "📊",
    title: "Smart Work Summaries",
    description: "Instant daily, weekly and monthly dashboards that show total hours, breaks and earnings all at a glance."
  }, {
    icon: "📝",
    title: "Easy Invoicing and PDF Export",
    description: "Convert shifts into invoices. Customise your company and client details, then download or email a PDF in seconds."
  }, {
    icon: "📤",
    title: "Instant Sharing",
    description: "Send timesheets, summaries or invoices via Email, WhatsApp or download. No extra apps needed."
  }, {
    icon: "💰",
    title: "Earnings Overview",
    description: "See what you have earned automatically based on your rates, including break deductions and day or hour calculations."
  }];
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);
  return <div className="font-body">
      {/* Hero Section */}
      <motion.section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6" initial="hidden" animate="visible" variants={containerVariants}>
        {/* Logo */}
        <motion.div className="mb-8" variants={itemVariants}>
          <img src="/lovable-uploads/5e5ad164-5fad-4fa8-8d19-cbccf2382c0e.png" alt="Clock Work Pal logo" className="w-64 h-auto mx-auto" />
        </motion.div>

        {/* Headline */}
        <motion.h1 className="font-display text-5xl md:text-6xl text-white mb-4 text-center" variants={itemVariants}>
          Smarter Time Tracking
        </motion.h1>

        {/* Subtext */}
        <motion.p className="font-body text-lg md:text-xl max-w-2xl text-white/90 text-center mb-8" variants={itemVariants}>
          Workers, freelancers & contractors: track shifts on the go, clock in/out in seconds, view earnings and send invoices anywhere.
        </motion.p>

        {/* Stripe Buy Button */}
        <motion.div variants={itemVariants} className="flex justify-center px-0 mx-0 my-[20px] py-0">
          <stripe-buy-button buy-button-id="buy_btn_1RWktGEC1YgoxpP0dQg2k7tx" publishable-key="pk_live_51RWcohEC1YgoxpP0YefSBYbfwCeflbZQbqlgnu1qqGANaPVd5V3sCdXp2ZuqJd06UK5Gnzrrccypy7FBB5gf7eEP00W6kU7kDE" />
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-12 px-6 bg-[#cfeaff]">
        <motion.div initial="hidden" whileInView="visible" viewport={{
        once: true
      }} variants={containerVariants}>
          <motion.h2 className="font-display text-3xl md:text-4xl text-brand-navy text-center mb-8" variants={itemVariants}>
            Key Features
          </motion.h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {features.map((feature, index) => <motion.div key={index} className="bg-white rounded-xl shadow-md p-5 flex flex-col items-start hover:shadow-lg transition-shadow" variants={itemVariants}>
                <span className="text-4xl mb-3">{feature.icon}</span>
                <h3 className="font-display text-2xl text-brand-navy mb-2">{feature.title}</h3>
                <p className="font-body text-neutral-700 leading-snug">{feature.description}</p>
              </motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* Redesigned Unlock Your Full Potential Section */}
      <motion.section className="bg-gradient-to-r from-purple-600 to-blue-600 py-16 px-6 text-white overflow-hidden" initial="hidden" whileInView="visible" viewport={{
      once: true
    }} variants={containerVariants}>
        <div className="max-w-7xl mx-auto px-[24px] my-[15px] text-sm font-normal text-slate-50">
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

          {/* CTA Section */}
          <motion.div className="text-center" variants={itemVariants}>
            {/* QR Code - smaller and static */}
            <motion.div className="flex justify-center mb-6" variants={itemVariants}>
              <img src="/lovable-uploads/13bdcfa2-eac3-481e-a07c-1f77b8f37fab.png" alt="Scan to subscribe QR Code" className="w-24 h-24 rounded-lg shadow-lg" />
            </motion.div>
            
            <motion.p className="font-body text-lg mb-8 max-w-2xl mx-auto opacity-80" variants={itemVariants}>Scan the QR code to start your 7-day free trial and take control of recorded hours so your boss can pay you correctly! </motion.p>
            
            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center" variants={itemVariants}>
              <Button asChild size="lg" className="px-12 py-4 bg-brand-accent text-brand-navy font-bold rounded-full shadow-xl hover:opacity-90 transition text-lg hover:scale-105 transform duration-200">
                
              </Button>
              
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