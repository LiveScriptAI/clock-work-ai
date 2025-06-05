
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap } from 'lucide-react';
import { toast } from 'sonner';

// Replace these with your actual Stripe Price IDs
const STRIPE_PRICES = {
  basic: 'price_1QdhlFEC1YgoxpP09PEPRRSs', // £10/month
  pro: 'price_1QdhlFEC1YgoxpP0Ng1tO9cF'      // £25/month
};

interface SubscriptionStatus {
  subscription_status: string | null;
  subscription_tier: string | null;
  stripe_customer_id: string | null;
}

export default function BillingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
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

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast.error('You must be logged in to subscribe.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId }
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

  const isSubscribed = subscriptionStatus?.subscription_status === 'active';
  const currentTier = subscriptionStatus?.subscription_tier;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('Choose Your Plan')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upgrade to unlock powerful features for professional time tracking and invoicing
          </p>
        </div>

        {message && (
          <div className="mb-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md text-center">
            {message}
          </div>
        )}

        {isSubscribed && (
          <div className="mb-8 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md text-center">
            <Crown className="inline w-5 h-5 mr-2" />
            You're currently subscribed to Clock Work Pal {currentTier === 'pro' ? 'Pro' : 'Basic'}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Basic Plan */}
          <Card className={`relative ${currentTier === 'basic' ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Basic Plan</CardTitle>
                {currentTier === 'basic' && (
                  <Badge variant="default">Current Plan</Badge>
                )}
              </div>
              <CardDescription>Perfect for individual freelancers</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">£10</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Unlimited time tracking
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Basic invoicing
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  PDF exports
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Email support
                </li>
              </ul>
              <Button 
                className="w-full" 
                variant={currentTier === 'basic' ? 'outline' : 'default'}
                onClick={() => handleSubscribe(STRIPE_PRICES.basic)}
                disabled={loading || currentTier === 'basic'}
              >
                {loading ? 'Processing...' : currentTier === 'basic' ? 'Current Plan' : 'Choose Basic'}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={`relative ${currentTier === 'pro' ? 'ring-2 ring-purple-500' : 'ring-2 ring-purple-200'}`}>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-purple-500 text-white px-3 py-1">
                <Zap className="w-4 h-4 mr-1" />
                Most Popular
              </Badge>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-purple-600">Pro Plan</CardTitle>
                {currentTier === 'pro' && (
                  <Badge variant="default">Current Plan</Badge>
                )}
              </div>
              <CardDescription>For growing businesses and teams</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-purple-600">£25</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Everything in Basic
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Advanced invoice customization
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Multiple export formats
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Priority support
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Advanced analytics
                </li>
              </ul>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
                onClick={() => handleSubscribe(STRIPE_PRICES.pro)}
                disabled={loading || currentTier === 'pro'}
              >
                {loading ? 'Processing...' : currentTier === 'pro' ? 'Current Plan' : 'Choose Pro'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-gray-600">
          <p className="mb-2">All plans include a 7-day free trial</p>
          <p>Cancel anytime. No hidden fees.</p>
        </div>
      </div>
    </div>
  );
}
