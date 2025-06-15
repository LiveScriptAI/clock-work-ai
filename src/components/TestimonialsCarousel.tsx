import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import testimonials from '@/data/testimonials';
export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prev = () => {
    setCurrentIndex(prev => prev === 0 ? testimonials.length - 1 : prev - 1);
  };
  const next = () => {
    setCurrentIndex(prev => prev === testimonials.length - 1 ? 0 : prev + 1);
  };
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prev();
      } else if (event.key === 'ArrowRight') {
        next();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const {
    name,
    city,
    text
  } = testimonials[currentIndex];
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
  return <motion.section id="testimonials" initial="hidden" whileInView="visible" viewport={{
    once: true
  }} variants={containerVariants} className="py-16 px-6 bg-[#cfeaff]">
      <motion.h2 className="font-display text-3xl md:text-4xl text-brand-navy text-center mb-12" variants={itemVariants}>
        What Our Users Say
      </motion.h2>
      
      <motion.div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 relative overflow-hidden" variants={itemVariants}>
        {/* Testimonial Content */}
        <motion.div key={currentIndex} initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} exit={{
        opacity: 0,
        x: -20
      }} transition={{
        duration: 0.3
      }} className="text-center">
          <blockquote className="font-body text-lg md:text-xl italic text-neutral-700 mb-6 leading-relaxed">
            "{text}"
          </blockquote>
          <div className="border-t border-gray-200 pt-4">
            <p className="font-display text-xl font-semibold text-brand-navy">{name}</p>
            <p className="font-body text-neutral-500 text-sm">{city}</p>
          </div>
        </motion.div>

        {/* Navigation Arrows */}
        <button onClick={prev} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-brand-accent text-brand-navy p-3 rounded-full shadow-lg hover:opacity-90 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2" aria-label="Previous testimonial">
          <ArrowLeft size={20} />
        </button>
        <button onClick={next} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-brand-accent text-brand-navy p-3 rounded-full shadow-lg hover:opacity-90 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2" aria-label="Next testimonial">
          <ArrowRight size={20} />
        </button>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, idx) => <button key={idx} onClick={() => goToSlide(idx)} className={`w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2 ${idx === currentIndex ? 'bg-brand-navy scale-110' : 'bg-neutral-300 hover:bg-neutral-400'}`} aria-label={`Go to testimonial ${idx + 1}`} />)}
        </div>

        {/* Progress indicator */}
        <div className="mt-4 text-center">
          
        </div>
      </motion.div>
    </motion.section>;
}