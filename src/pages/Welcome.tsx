
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Clock, BarChart3, Share2 } from "lucide-react";

const WelcomePage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const features = [
    {
      icon: <Clock size={24} />,
      title: "Live Time Tracking",
      description: "Track your shifts with start, end, and break timers."
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Smart Summaries",
      description: "Get weekly reports of your hours and estimated earnings."
    },
    {
      icon: <Share2 size={24} />,
      title: "Instant Sharing",
      description: "Send your work summary via WhatsApp, Email, or Download."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 px-5 py-8">
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* App Header */}
        <motion.div 
          className="text-center mb-10"
          variants={itemVariants}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Clock Work AI
          </h1>
          <p className="mt-2 text-gray-600">
            Smarter time tracking for workers, freelancers, and contractors.
          </p>
        </motion.div>

        {/* App Icon/Logo */}
        <motion.div 
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg mb-10"
          variants={itemVariants}
        >
          <Clock className="w-10 h-10 text-white" strokeWidth={1.5} />
        </motion.div>

        {/* Features List */}
        <div className="w-full max-w-md space-y-4 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="p-4 bg-white rounded-xl shadow-sm border border-gray-100"
              variants={itemVariants}
            >
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-indigo-50 mr-3">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div 
        className="w-full space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6">
            <Link to="/register">Create Account</Link>
          </Button>
        </motion.div>
        
        <motion.div 
          className="text-center"
          variants={itemVariants}
        >
          <Link 
            to="/login" 
            className="text-indigo-600 text-sm hover:underline"
          >
            Already have an account? Sign in
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
