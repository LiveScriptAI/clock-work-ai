
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionGateProps {
  children: React.ReactNode;
  requiredTier?: 'basic' | 'pro';
  feature?: string;
  redirectTo?: string;
}

// Developer emails that should have full access
const DEVELOPER_EMAILS = ['dytransport20@gmail.com'];

export function SubscriptionGate({ 
  children, 
  requiredTier = 'basic',
  feature = 'this feature',
  redirectTo = '/billing'
}: SubscriptionGateProps) {
  const { user, isSubscribed, subscriptionTier } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState({
    subscribed: false,
    subscription_tier: null as string | null,
    subscription_status: null as string | null
  });

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Check if user is a developer
    if (DEVELOPER_EMAILS.includes(user.email || '')) {
      console.log('Developer access granted for:', user.email);
      setSubscriptionData({
        subscribed: true,
        subscription_tier: 'pro',
        subscription_status: 'active'
      });
      setIsLoading(false);
      return;
    }

    const checkSubscription = async () => {
      try {
        setIsLoading(true);
        console.log('Checking subscription status...');
        
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) {
          console.error('Error checking subscription:', error);
          // Fall back to useAuth data if available
          setSubscriptionData({
            subscribed: isSubscribed || false,
            subscription_tier: subscriptionTier || null,
            subscription_status: null
          });
        } else {
          console.log('Subscription check result:', data);
          setSubscriptionData({
            subscribed: data.subscribed || false,
            subscription_tier: data.subscription_tier || null,
            subscription_status: data.subscription_status || null
          });
        }
      } catch (error) {
        console.error('Failed to check subscription:', error);
        // Fall back to useAuth data
        setSubscriptionData({
          subscribed: isSubscribed || false,
          subscription_tier: subscriptionTier || null,
          subscription_status: null
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [user, isSubscribed, subscriptionTier]);

  // Show loading state while checking subscription
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Checking subscription status...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  // Check if user has required access (including developer access)
  const isDeveloper = DEVELOPER_EMAILS.includes(user.email || '');
  const hasAccess = isDeveloper || (subscriptionData.subscribed && (
    requiredTier === 'basic' || 
    (requiredTier === 'pro' && subscriptionData.subscription_tier === 'pro')
  ));

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show subscription gate for non-developers without subscription
  const handleUpgradeClick = () => {
    navigate(redirectTo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="text-center py-8 max-w-md w-full">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">
            Upgrade to {requiredTier === 'pro' ? 'Pro' : 'Basic'} to unlock {feature}
          </CardTitle>
          <CardDescription className="text-lg">
            {requiredTier === 'pro' 
              ? 'Get access to advanced features and priority support'
              : 'Start your professional time tracking journey'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={handleUpgradeClick}
          >
            View Plans
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
