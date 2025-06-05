import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Clock, FileText, Calculator, Share2, TrendingUp, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Updated with your actual Stripe Price ID
const STRIPE_PRICE_ID = 'price_1RWdO5EC1YgoxpP0DJ5KJkUI';

interface SubscriptionStatus {
  subscription_status: string | null;
  subscription_tier: string | null;
  stripe_customer_id: string | null;
}

export default function BillingPage() {
  const { t } = useTranslation();
  const { user, isSubscribed, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  // Check URL for session_id on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const canceled = params.get('canceled');
    
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

  // Fetch user's subscription status only if user exists
  useEffect(() => {
    if (user?.id) {
      fetchSubscriptionStatus();
    }
  }, [user]);

  // Redirect subscribed users to dashboard
  useEffect(() => {
    if (isSubscribed && !loading) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000); // Give time to show success message
    }
  }, [isSubscribed, loading, navigate]);

  const fetchSubscriptionStatus = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_tier, stripe_customer_id')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is fine for new users
        throw error;
      }
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
        toast.success('Subscription activated! Redirecting to dashboard...');
        await fetchSubscriptionStatus();
        await refreshProfile();
        
        // Redirect to dashboard after successful subscription
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
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

  const handleSubscribe = async () => {
    // If user is not logged in, redirect to register page with a return parameter
    if (!user) {
      toast.error('Please create an account or log in to start your free trial.');
      navigate('/register?return=billing');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Creating checkout session with Price ID:', STRIPE_PRICE_ID);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: STRIPE_PRICE_ID
        }
      });
      
      if (error) throw error;
      
      if (data.url) {
        console.log('Redirecting to checkout URL:', data.url);
        // Use window.location.href for better compatibility
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Error creating checkout session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentIsSubscribed = subscriptionStatus?.subscription_status === 'active';

  // ... keep existing code (features array definition)
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
    <div className="min-h-screen bg-gradient-to-br from-brand-neutralBg via-white to-blue-50 bg-[#cfeaff]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl text-brand-navy mb-4">
            Unlock Your Full Potential
          </h1>
          <p className="font-body text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your time tracking with professional features designed for serious contractors, employees and freelancers.
          </p>
        </div>

        {/* Status Messages */}
        {message && (
          <div className="mb-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl text-center">
            {message}
          </div>
        )}

        {currentIsSubscribed && (
          <div className="mb-8 p-4 bg-gradient-to-r from-brand-accent/20 to-yellow-100 border border-brand-accent/50 text-brand-navy rounded-xl text-center">
            <Crown className="inline w-5 h-5 mr-2" />
            <strong>You're subscribed to Clock Work Pal Pro!</strong> Redirecting to dashboard...
          </div>
        )}

        {/* Authentication prompt for non-logged in users */}
        {!user && !loading && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-center">
            <p className="mb-2">
              <strong>Ready to start your free trial?</strong> You'll need to create an account first.
            </p>
            <p className="text-sm">
              Don't worry - it only takes 30 seconds and your trial starts immediately!
            </p>
          </div>
        )}

        {/* Main Pricing Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="relative border-2 border-brand-accent shadow-2xl bg-white">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-brand-primaryStart to-brand-primaryEnd text-white px-6 py-2 text-lg font-bold">
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

              {/* CTA Button */}
              <Button 
                onClick={handleSubscribe} 
                disabled={loading || currentIsSubscribed}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-brand-primaryStart to-brand-primaryEnd hover:from-brand-primaryStart/90 hover:to-brand-primaryEnd/90 text-white shadow-lg transform transition hover:scale-105"
              >
                {loading ? (
                  'Processing...'
                ) : currentIsSubscribed ? (
                  <>
                    <Crown className="w-5 h-5 mr-2" />
                    You're Subscribed!
                  </>
                ) : user ? (
                  'Start Your Free Trial'
                ) : (
                  'Create Account & Start Free Trial'
                )}
              </Button>

              {!currentIsSubscribed && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  {user 
                    ? 'No payment required for your 7-day trial. Cancel anytime.'
                    : 'Create your account and start your 7-day free trial instantly!'
                  }
                </p>
              )}
            </CardContent>
          </Card>
        </div>

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
