
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StripeCheckoutButton from "@/components/StripeCheckoutButton";

const CTAButtons = () => {
  // Since auth is removed, default to "user not logged in" state
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button asChild size="lg" className="px-12 py-4 bg-brand-accent text-brand-navy font-bold rounded-full shadow-xl hover:opacity-90 transition text-lg hover:scale-105 transform duration-200">
        <Link to="/register">Start Free Trial</Link>
      </Button>
      <Button asChild className="px-8 py-4 bg-white text-brand-navy font-medium rounded-full hover:bg-white/90 transition text-lg shadow-xl border-2 border-white">
        <Link to="/login">Login</Link>
      </Button>
    </div>
  );
};

export default CTAButtons;
