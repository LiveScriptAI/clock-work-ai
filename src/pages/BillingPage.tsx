
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Clock, FileText, Calculator, Share2, TrendingUp, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Navigate, useSearchParams } from 'react-router-dom';
import { CheckoutSuccess } from "@/components/CheckoutSuccess";
import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";
import { AuthenticatedCheckoutButton } from "@/components/AuthenticatedCheckoutButton";

interface SubscriptionStatus {
  subscription_status: string | null;
  subscription_tier: string | null;
  stripe_customer_id: string | null;
}

export default function BillingPage() {
  const { t } = useTranslation();
  const { user, profile, isLoading } = useAuth();
  const [searchParams] = useSearchParams();

  // Check if this is a checkout success/cancel scenario
  const sessionId = searchParams.get('session_id');
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  if (!isLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-navy" />
      </div>
    );
  }

  // Show checkout success/cancel handling
  if (sessionId || success || canceled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <CheckoutSuccess />
        </div>
      </div>
    );
  }

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  // Check URL for session_id on mount
  useEffect(() => {
    if (sessionId) {
      verifyCheckout(sessionId);
    } else if (canceled) {
      setMessage('Subscription canceled. You can try again anytime.');
    }

    // Clean up URL
    if (sessionId || canceled) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch user's subscription status
  useEffect(() => {
    if (user?.id) {
      fetchSubscriptionStatus();
    }
  }, [user]);

  const fetchSubscriptionStatus = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_tier, stripe_customer_id')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const verifyCheckout = async (sessionId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-checkout', {
        body: { sessionId }
      });
      if (error) throw error;
      if (data.success) {
        setMessage('Subscription activated successfully! Welcome to Clock Work Pal Pro.');
        toast.success('Subscription activated!');
        await fetchSubscriptionStatus();
      } else {
        setMessage('There was an issue verifying your subscription. Please contact support.');
        toast.error('Verification failed');
      }
    } catch (error) {
      console.error('Error verifying checkout:', error);
      setMessage('Error verifying subscription. Please contact support.');
      toast.error('Verification error');
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = subscriptionStatus?.subscription_status === 'active';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-neutralBg via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl text-brand-navy mb-4">
            {isSubscribed ? 'Manage Your Subscription' : 'Unlock Your Full Potential'}
          </h1>
          <p className="font-body text-xl text-gray-600 max-w-3xl mx-auto">
            {isSubscribed 
              ? 'View your subscription details and manage your account settings.'
              : 'Transform your time tracking with professional features designed for serious contractors, employees and freelancers.'
            }
          </p>
        </div>

        {/* Status Messages */}
        {message && (
          <div className="mb-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl text-center">
            {message}
          </div>
        )}

        {isSubscribed && (
          <div className="mb-8 p-4 bg-gradient-to-r from-brand-accent/20 to-yellow-100 border border-brand-accent/50 text-brand-navy rounded-xl text-center">
            <Crown className="inline w-5 h-5 mr-2" />
            <strong>You're subscribed to Clock Work Pal Pro!</strong> Enjoy all premium features.
          </div>
        )}

        {/* Subscription Management for Active Users */}
        {isSubscribed && (
          <div className="max-w-2xl mx-auto mb-12">
            <Card className="border-2 border-green-200 shadow-lg bg-white">
              <CardHeader className="text-center">
                <CardTitle className="font-display text-3xl text-brand-navy mb-2 flex items-center justify-center">
                  <Crown className="w-8 h-8 mr-3 text-brand-accent" />
                  Active Subscription
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Plan: {subscriptionStatus?.subscription_tier || 'Premium'}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <div className="grid gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-brand-navy mb-2">Subscription Status</h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span> Active
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Plan:</span> {subscriptionStatus?.subscription_tier || 'Premium'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ManageSubscriptionButton 
                    variant="default"
                    size="lg"
                    className="w-full bg-gradient-to-r from-brand-primaryStart to-brand-primaryEnd text-white font-bold"
                  />
                </div>

                <p className="text-center text-sm text-gray-500 mt-4">
                  Update payment method, view billing history, or cancel your subscription.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Pricing Card for Non-Subscribers */}
        {!isSubscribed && (
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
        )}

        {/* Trust Indicators */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              7-Day Free Trial
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              Cancel Anytime
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              No Hidden Fees
            </div>
          </div>
          
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of contractors, employees and freelancers who trust Clock Work Pal 
            for their professional time tracking and invoicing needs.
          </p>
        </div>
      </div>
    </div>
  );
}
