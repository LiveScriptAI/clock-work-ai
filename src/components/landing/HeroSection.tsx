
import React from 'react';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* App Icon */}
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/7210a4ef-1005-4b91-8781-0fd59a935334.png" 
              alt="Clock Work Pal App Icon" 
              className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl shadow-lg"
            />
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Your Pocket-Sized<br />
              <span className="text-blue-600">Work Pal</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Track shifts, breaks, and earnings with ease — built for self-employed and agency workers.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <div className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-full font-semibold shadow-lg">
              <span>Now Available on iOS</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Coming soon to the App Store</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
