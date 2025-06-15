
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Calculator, Share2, TrendingUp, Shield } from 'lucide-react';
import { AuthenticatedCheckoutButton } from '@/components/AuthenticatedCheckoutButton';

const features = [
  {
    icon: Clock,
    title: "Live Time Tracking",
    description: "Start and end shifts and breaks in real time"
  },
  {
    icon: FileText,
    title: "Professional Invoicing",
    description: "Create and send custom branded invoices instantly"
  },
  {
    icon: Calculator,
    title: "Automatic Calculations",
    description: "Earnings, hours, and break deductions calculated automatically"
  },
  {
    icon: TrendingUp,
    title: "Smart Analytics",
    description: "Daily, weekly, and monthly work summaries"
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Send timesheets via Email, WhatsApp or download PDF"
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Your data is safe and accessible anywhere"
  }
];

export function PricingCard() {
  return (
    <div className="max-w-2xl mx-auto mb-12">
      <Card className="relative border-2 border-brand-accent shadow-2xl bg-white">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-brand-primaryStart to-brand-primaryEnd text-white text-lg font-bold mx-0 my-0 px-[10px] py-px">
            7-Day Free Trial
          </Badge>
        </div>
        
        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="font-display text-4xl text-brand-navy mb-2">
            Clock Work Pal Pro
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Everything you need for professional time tracking
          </CardDescription>
          
          <div className="mt-6">
            <div className="flex items-center justify-center">
              <span className="text-6xl font-bold text-brand-navy">£3.99</span>
              <span className="text-2xl text-gray-600 ml-2">/month</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Cancel anytime • No hidden fees</p>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-brand-navy" />
                </div>
                <div>
                  <h4 className="font-semibold text-brand-navy text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex justify-center items-center w-full">
            <AuthenticatedCheckoutButton 
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-brand-primaryStart to-brand-primaryEnd text-white shadow-lg hover:opacity-90 transition"
              size="lg"
            />
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            No payment required for your 7-day trial. Cancel anytime.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
