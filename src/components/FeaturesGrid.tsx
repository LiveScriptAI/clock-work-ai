
import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const FeaturesGrid = () => {
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

  const featureList: Feature[] = [
    {
      icon: "⌚",
      title: "Live Time Tracking",
      description: "Start and end shifts and breaks in real time. Your time keeps counting even if you reload the app."
    },
    {
      icon: "📊",
      title: "Smart Work Summaries",
      description: "Instant daily, weekly and monthly dashboards that show total hours, breaks and earnings all at a glance."
    },
    {
      icon: "📝",
      title: "Easy Invoicing and PDF Export",
      description: "Convert shifts into invoices. Customise your company and client details, then download or email a PDF in seconds."
    },
    {
      icon: "📤",
      title: "Instant Sharing",
      description: "Send timesheets, summaries or invoices via Email, WhatsApp or download. No extra apps needed."
    },
    {
      icon: "💰",
      title: "Earnings Overview",
      description: "See what you have earned automatically based on your rates, including break deductions and day or hour calculations."
    },
    {
      icon: "🌐",
      title: "Multiple Language Support",
      description: "Choose English, Spanish, French and more—so you can use the app in your preferred language."
    }
  ];

  return (
    <section id="features" className="py-12 px-6 bg-[#cfeaff]">
      <motion.div 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true }} 
        variants={containerVariants}
      >
        <motion.h2 
          className="font-display text-3xl md:text-4xl text-brand-navy text-center mb-8" 
          variants={itemVariants}
        >
          Key Features
        </motion.h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {featureList.map((feature, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start hover:shadow-lg transition-shadow" 
              variants={itemVariants}
            >
              {feature.icon === "🌐" ? (
                <Globe className="w-10 h-10 mb-3 text-brand-navy" />
              ) : (
                <span className="text-4xl mb-3">{feature.icon}</span>
              )}
              <h3 className="font-display text-2xl text-brand-navy mb-2">{feature.title}</h3>
              <p className="font-body text-neutral-700 leading-snug">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default FeaturesGrid;
