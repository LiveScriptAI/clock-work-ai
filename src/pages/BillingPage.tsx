import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Clock, FileText, Calculator, Share2, TrendingUp, Shield, QrCode } from 'lucide-react';
import { toast } from 'sonner';

// Update this with your actual Stripe Price ID for £3.99/month
const STRIPE_PRICE_ID = 'price_1QdhlFEC1YgoxpP09PEPRRSs';

interface SubscriptionStatus {
  subscription_status: string | null;
  subscription_tier: string | null;
  stripe_customer_id: string | null;
}

export default function BillingPage() {
  const { t } = useTranslation();
  const { user, isInitialized } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  // Check URL for session_id on mount and handle auto-checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const canceled = params.get('canceled');
    const autoCheckout = params.get('checkout');
    
    if (sessionId) {
      verifyCheckout(sessionId);
    } else if (canceled) {
      setMessage('Subscription canceled. You can try again anytime.');
    } else if (autoCheckout === 'auto' && user) {
      // Auto-start checkout for verified users coming from email
      console.log('Auto-starting checkout for verified user');
      handleSubscribe();
    }

    // Clean up URL
    if (sessionId || canceled || autoCheckout) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]); // Add user as dependency to trigger when auth state changes

  // Fetch user's subscription status only if user is logged in
  useEffect(() => {
    if (user?.id && isInitialized) {
      fetchSubscriptionStatus();
    }
  }, [user, isInitialized]);

  const fetchSubscriptionStatus = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_tier, stripe_customer_id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching subscription status:', error);
        setSubscriptionStatus({
          subscription_status: null,
          subscription_tier: null,
          stripe_customer_id: null
        });
      } else {
        setSubscriptionStatus(data || {
          subscription_status: null,
          subscription_tier: null,
          stripe_customer_id: null
        });
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setSubscriptionStatus({
        subscription_status: null,
        subscription_tier: null,
        stripe_customer_id: null
      });
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

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please register first to start your free trial.');
      // Redirect to register page instead of login
      window.location.href = '/register';
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId: STRIPE_PRICE_ID }
      });
      
      if (error) throw error;
      
      if (data.url) {
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

  // Show loading state while checking user authentication (only if there's a user)
  if (user && !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-neutralBg via-white to-blue-50 bg-[#cfeaff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-navy mx-auto mb-4"></div>
          <p className="text-brand-navy">Loading...</p>
        </div>
      </div>
    );
  }

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

  // Add Stripe script to head
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

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

        {isSubscribed && (
          <div className="mb-8 p-4 bg-gradient-to-r from-brand-accent/20 to-yellow-100 border border-brand-accent/50 text-brand-navy rounded-xl text-center">
            <Crown className="inline w-5 h-5 mr-2" />
            <strong>You're subscribed to Clock Work Pal Pro!</strong> Enjoy all premium features.
          </div>
        )}

        {/* Enhanced Login Section for non-authenticated users */}
        {!user && (
          <div className="mb-8 bg-white rounded-xl shadow-lg border-2 border-brand-accent/30 p-6">
            <div className="text-center">
              <h3 className="font-display text-2xl text-brand-navy mb-3">Already have an account?</h3>
              <p className="text-gray-600 mb-6">Sign in to activate your free trial or manage your subscription</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Button 
                  onClick={() => window.location.href = '/login'} 
                  className="flex-1 bg-gradient-to-r from-brand-primaryStart to-brand-primaryEnd text-white font-semibold py-3 rounded-full shadow-lg hover:opacity-90 transition"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => window.location.href = '/register'} 
                  variant="outline"
                  className="flex-1 border-2 border-brand-navy text-brand-navy font-semibold py-3 rounded-full hover:bg-brand-navy hover:text-white transition"
                >
                  Create Account
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                New users get a 7-day free trial • No payment required to start
              </p>
            </div>
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

              {/* Stripe Buy Button */}
              {!isSubscribed && (
                <div className="space-y-4">
                  <div 
                    dangerouslySetInnerHTML={{
                      __html: `
                        <stripe-buy-button
                          buy-button-id="buy_btn_1RWktGEC1YgoxpP0dQg2k7tx"
                          publishable-key="pk_live_51RWcohEC1YgoxpP0YefSBYbfwCeflbZQbqlgnu1qqGANaPVd5V3sCdXp2ZuqJd06UK5Gnzrrccypy7FBB5gf7eEP00W6kU7kDE"
                        >
                        </stripe-buy-button>
                      `
                    }}
                  />
                  
                  {/* Alternative Payment Options */}
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">Alternative payment options:</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      {/* QR Code */}
                      <div className="flex flex-col items-center">
                        <img 
                          src="/lovable-uploads/f202fde7-03fb-4ff7-bde7-1be50aa1607c.png" 
                          alt="Scan to subscribe QR code" 
                          className="w-24 h-24 mb-2"
                        />
                        <p className="text-xs text-gray-500">Scan to subscribe</p>
                      </div>
                      
                      {/* Direct Payment Link */}
                      <div className="flex flex-col items-center">
                        <Button 
                          onClick={() => window.open('https://buy.stripe.com/aFa9AT1mo0sRbiTdANc7u00', '_blank')}
                          variant="outline"
                          className="text-sm px-4 py-2"
                        >
                          Direct Payment Link
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">Opens in new tab</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscribed State */}
              {isSubscribed && (
                <div className="text-center">
                  <Crown className="w-12 h-12 text-brand-accent mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-brand-navy mb-2">You're Subscribed!</h3>
                  <p className="text-gray-600">Enjoy all premium features of Clock Work Pal Pro.</p>
                </div>
              )}

              {!isSubscribed && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  {user ? 
                    "No payment required for your 7-day trial. Cancel anytime." :
                    "Create an account to start your 7-day free trial. No payment required."
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
