
import React from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import HeroSection from '@/components/landing/HeroSection';
import FeatureHighlights from '@/components/landing/FeatureHighlights';
import UserFocusedSection from '@/components/landing/UserFocusedSection';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <FeatureHighlights />
        <UserFocusedSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
