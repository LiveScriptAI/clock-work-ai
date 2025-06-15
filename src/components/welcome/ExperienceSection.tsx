
import React from "react";
import { motion } from "framer-motion";

interface ExperienceSectionProps {
  containerVariants: any;
  itemVariants: any;
  imageVariants: any;
  floatAnimation: any;
}

const ExperienceSection = ({ 
  containerVariants, 
  itemVariants, 
  imageVariants, 
  floatAnimation 
}: ExperienceSectionProps) => {
  return (
    <motion.section 
      className="bg-gradient-to-r from-purple-600 to-blue-600 py-16 px-4 sm:px-6 lg:px-8 text-white overflow-hidden w-full" 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true }} 
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto w-full">
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
  );
};

export default ExperienceSection;
