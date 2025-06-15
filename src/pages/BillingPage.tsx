
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { CheckoutSuccess } from "@/components/CheckoutSuccess";
import { BillingAuthGuards } from "@/components/billing/BillingAuthGuards";
import { BillingHeader } from "@/components/billing/BillingHeader";
import { SubscriptionManagement } from "@/components/billing/SubscriptionManagement";
import { PricingCard } from "@/components/billing/PricingCard";
import { TrustIndicators } from "@/components/billing/TrustIndicators";

interface SubscriptionStatus {
  subscription_status: string | null;
  subscription_tier: string | null;
  stripe_customer_id: string | null;
}

export default function BillingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Check for auth guards first
  const authGuard = BillingAuthGuards();
  if (authGuard) return authGuard;

  // Check if this is a checkout success/cancel scenario
  const sessionId = searchParams.get('session_id');
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-neutralBg via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BillingHeader isSubscribed={isSubscribed} />

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
        {isSubscribed && <SubscriptionManagement subscriptionStatus={subscriptionStatus} />}

        {/* Main Pricing Card for Non-Subscribers */}
        {!isSubscribed && <PricingCard />}

        {/* Trust Indicators */}
        <TrustIndicators />
      </div>
    </div>
  );
}
