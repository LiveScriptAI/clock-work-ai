import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PreviewTimeTracking } from "@/components/preview/PreviewTimeTracking";

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
        <motion.div className="flex justify-center" variants={itemVariants}>
          <stripe-buy-button
            buy-button-id="buy_btn_1RWktGEC1YgoxpP0dQg2k7tx"
            publishable-key="pk_live_51RWcohEC1YgoxpP0YefSBYbfwCeflbZQbqlgnu1qqGANaPVd5V3sCdXp2ZuqJd06UK5Gnzrrccypy7FBB5gf7eEP00W6kU7kDE"
          />
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

      {/* Interactive Preview Section */}
      <motion.section 
        className="py-16 px-6 bg-gradient-to-b from-gray-50 to-white" 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true }} 
        variants={containerVariants}
      >
        <motion.div className="max-w-6xl mx-auto" variants={itemVariants}>
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="font-display text-4xl md:text-5xl text-brand-navy mb-4">
              Try Time Tracking Now
            </h2>
            <p className="font-body text-xl text-gray-600 max-w-3xl mx-auto">
              Experience our intuitive time tracking interface. Start a shift, take breaks, and see how easy it is to manage your work hours.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <PreviewTimeTracking />
          </motion.div>
          
          <motion.div className="text-center mt-8" variants={itemVariants}>
            <p className="text-gray-600 mb-4">Ready to save your time tracking data and unlock all features?</p>
            <Button asChild size="lg" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-full shadow-xl">
              <Link to="/register">Start Your 7-Day Free Trial</Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Pricing/Billing CTA Section */}
      <motion.section className="bg-gradient-to-r from-purple-600 to-blue-600 py-16 px-6 text-center text-white" initial="hidden" whileInView="visible" viewport={{
      once: true
    }} variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <motion.div className="mb-6" variants={itemVariants}>
            <span className="text-5xl">💎</span>
          </motion.div>
          <motion.h3 className="font-display text-4xl md:text-5xl mb-4" variants={itemVariants}>
            Unlock Your Full Potential
          </motion.h3>
          <motion.p className="font-body text-xl md:text-2xl mb-6 max-w-3xl mx-auto opacity-90" variants={itemVariants}>Transform your clocking in and out process with live time tracking, send professional branded invoicing and premium features designed for serious contractors, employees and freelancers.</motion.p>
          <motion.p className="font-body text-lg mb-8 max-w-2xl mx-auto opacity-80" variants={itemVariants}>
            From £10/month - Cancel anytime. Start your 7-day free trial today.
          </motion.p>
          <motion.div variants={itemVariants}>
            <Button asChild size="lg" className="px-10 py-4 bg-brand-accent text-brand-navy font-bold rounded-full shadow-xl hover:opacity-90 transition text-lg">
              <Link to="/billing">View Plans & Pricing</Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      <motion.section initial="hidden" whileInView="visible" viewport={{
      once: true
    }} variants={containerVariants} className="py-12 px-6 text-center bg-[#d0eaff]">
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
