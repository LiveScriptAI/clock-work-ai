
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Crown, ArrowRight, LogOut } from "lucide-react";

const SubscriptionRequiredPage = () => {
  const { handleSignOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-6 font-body">
      <div className="flex flex-col items-center max-w-md w-full">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/lovable-uploads/5e5ad164-5fad-4fa8-8d19-cbccf2382c0e.png" 
            alt="Clock Work Pal logo" 
            className="w-56 h-auto mx-auto"
          />
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-center text-2xl font-display text-brand-navy">
              Subscription Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-brand-navy font-body">
                Welcome! To access Clock Work Pal's professional time tracking features, 
                you'll need an active subscription.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-brand-navy mb-2">What you get:</h3>
                <ul className="text-left text-sm text-brand-navy space-y-1">
                  <li>✓ Professional time tracking</li>
                  <li>✓ Custom invoicing</li>
                  <li>✓ Work analytics</li>
                  <li>✓ 7-day free trial</li>
                  <li>✓ Cancel anytime</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <Link to="/billing">
                  <Button className="w-full bg-gradient-to-r from-brand-primaryStart to-brand-primaryEnd text-white font-semibold rounded-full shadow-lg hover:opacity-90 transition font-body">
                    Start Your Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="w-full font-body"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionRequiredPage;
