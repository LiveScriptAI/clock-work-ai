import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
  return <div className="font-body">
      {/* Hero Section */}
      <motion.section className="min-h-screen flex flex-col items-center justify-center bg-hero-gradient text-white px-6" initial="hidden" animate="visible" variants={containerVariants}>
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

        {/* Buttons */}
        <motion.div className="flex flex-col sm:flex-row gap-4" variants={itemVariants}>
          <Button asChild className="px-8 py-3 bg-brand-accent text-brand-navy font-semibold rounded-full shadow-lg hover:opacity-90 transition">
            <Link to="/register" className="mx-0 px-[32px] py-[29px] my-px">Get Started</Link>
          </Button>
          <button className="px-8 py-3 border-2 border-white text-white font-medium rounded-full hover:bg-white/20 transition">
            <a href="#features">Learn More</a>
          </button>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="bg-brand-neutralBg py-12 px-6">
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

      {/* CTA Section */}
      <motion.section className="bg-white py-12 px-6 text-center" initial="hidden" whileInView="visible" viewport={{
      once: true
    }} variants={containerVariants}>
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