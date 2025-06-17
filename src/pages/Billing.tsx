
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield } from "lucide-react";
import StartTrialButton from "@/components/billing/StartTrialButton";

const Billing = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-neutralBg to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display text-brand-navy mb-2">
            Clock Work Pal
          </h1>
          <div className="w-16 h-1 bg-hero-gradient mx-auto rounded-full"></div>
        </div>

        {/* Trial Card */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-hero-gradient rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-semibold text-brand-navy">
              Get Full Access with a 7-Day Free Trial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-gray-600 text-lg">
              After your trial, it's just £3.99/month. Cancel anytime.
            </p>
            
            {/* CTA Button */}
            <StartTrialButton />
            
            {/* Security Info */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>This is a secure checkout powered by Stripe.</span>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out Button */}
        <div className="text-center">
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="text-gray-600 hover:text-gray-800 border-gray-300"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
