
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Clock, FileText, Calculator, Share2, TrendingUp, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionStatus {
  subscription_status: string | null;
  subscription_tier: string | null;
  stripe_customer_id: string | null;
}

export default function BillingPage() {
  const { t } = useTranslation();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  // Check URL for session_id or payment status on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const canceled = params.get('canceled');
    const paymentStatus = params.get('payment_status');
    
    console.log('URL params detected:', { sessionId, canceled, paymentStatus });

    if (sessionId && paymentStatus === 'success') {
      console.log('Payment success detected, verifying checkout...');
      verifyCheckout(sessionId);
    } else if (canceled === 'true' || paymentStatus === 'canceled') {
      setMessage('Subscription canceled. You can try again anytime.');
      toast.error('Payment was canceled');
    }

    // Clean up URL parameters after processing
    if (sessionId || canceled || paymentStatus) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
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
      console.log('Subscription status fetched:', data);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const verifyCheckout = async (sessionId: string) => {
    setVerifying(true);
    setLoading(true);
    
    try {
      console.log('Verifying checkout with session ID:', sessionId);
      
      const { data, error } = await supabase.functions.invoke('verify-checkout', {
        body: { sessionId }
      });
      
      if (error) {
        console.error('Verify checkout error:', error);
        throw error;
      }
      
      console.log('Verify checkout response:', data);
      
      if (data.success) {
        setMessage('Subscription activated successfully! Welcome to Clock Work Pal Pro.');
        toast.success('Subscription activated! Redirecting to dashboard...');
        
        // Refresh the auth session to get updated user data
        console.log('Refreshing auth session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session refresh error:', sessionError);
        } else {
          console.log('Session refreshed successfully');
        }
        
        // Refresh profile data
        await refreshProfile();
        await fetchSubscriptionStatus();
        
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          console.log('Navigating to dashboard...');
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
      setVerifying(false);
      setLoading(false);
    }
  };

  const handleStartTrial = () => {
    // Open in the same window instead of new tab
    window.location.href = 'https://buy.stripe.com/aFa9AT1mo0sRbiTdANc7u00';
  };

  const isSubscribed = subscriptionStatus?.subscription_status === 'active';

  // Show verification loading state
  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-neutralBg via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <CardContent>
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-brand-navy" />
            <h2 className="text-xl font-semibold text-brand-navy mb-2">Verifying Your Subscription</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            Unlock Your Full Potential
          </h1>
          <p className="font-body text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your time tracking with professional features designed for serious contractors, employees and freelancers.
          </p>
        </div>

        {/* Status Messages */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl text-center ${
            message.includes('successfully') 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : message.includes('canceled')
              ? 'bg-yellow-100 border border-yellow-400 text-yellow-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {isSubscribed && (
          <div className="mb-8 p-4 bg-gradient-to-r from-brand-accent/20 to-yellow-100 border border-brand-accent/50 text-brand-navy rounded-xl text-center">
            <Crown className="inline w-5 h-5 mr-2" />
            <strong>You're subscribed to Clock Work Pal Pro!</strong> Enjoy all premium features.
          </div>
        )}

        {/* Main Pricing Card */}
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
                {isSubscribed ? (
                  <Button disabled className="w-full h-14 text-lg font-bold bg-gradient-to-r from-brand-primaryStart to-brand-primaryEnd text-white shadow-lg">
                    <Crown className="w-5 h-5 mr-2" />
                    You're Subscribed!
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStartTrial}
                    disabled={loading}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-brand-primaryStart to-brand-primaryEnd text-white shadow-lg hover:opacity-90 transition"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Start Your Free Trial'
                    )}
                  </Button>
                )}
              </div>

              {!isSubscribed && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  No payment required for your 7-day trial. Cancel anytime.
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
