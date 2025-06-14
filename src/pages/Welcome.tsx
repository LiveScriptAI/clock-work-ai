
import React from "react";
import HeroSection from "@/components/welcome/HeroSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import AppPreviewSection from "@/components/welcome/AppPreviewSection";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import FinalCTASection from "@/components/welcome/FinalCTASection";

const WelcomePage = () => {
  return (
    <div className="font-body">
      <HeroSection />
      <FeaturesGrid />
      <AppPreviewSection />
      <TestimonialsCarousel />
      <FinalCTASection />
    </div>
  );
};

export default WelcomePage;
