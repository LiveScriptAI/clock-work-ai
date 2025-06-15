
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AuthenticatedCheckoutButton } from "@/components/AuthenticatedCheckoutButton";

interface GetStartedStepsProps {
  itemVariants: any;
  isLoading: boolean;
  hasAccount: boolean;
  isEmailVerified: boolean;
  isSubscribed: boolean;
}

const GetStartedSteps = ({ 
  itemVariants, 
  isLoading, 
  hasAccount, 
  isEmailVerified, 
  isSubscribed 
}: GetStartedStepsProps) => {
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
    <>
      {/* Get Started Instructions */}
      <motion.div className="text-center mb-8" variants={itemVariants}>
        <h3 className="font-display text-white mb-4 text-2xl sm:text-3xl">Get started in 2 simple steps:</h3>
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
        <motion.p className="font-body text-sm text-white/80 text-center max-w-md mt-4 mx-auto" variants={itemVariants}>
          ⚠️ Please create your account first to ensure your subscription and activity data are properly saved.
        </motion.p>
      )}

      {!isLoading && hasAccount && !isEmailVerified && (
        <motion.p className="font-body text-sm text-white/80 text-center max-w-md mt-4 mx-auto" variants={itemVariants}>
          📧 Please check your email and click the verification link to complete your account setup.
        </motion.p>
      )}
    </>
  );
};

export default GetStartedSteps;
