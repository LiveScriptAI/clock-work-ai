
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SubscriptionGateProps {
  children: React.ReactNode;
  requiredTier?: 'basic' | 'pro';
  feature?: string;
}

export function SubscriptionGate({ 
  children, 
  requiredTier = 'basic',
  feature = 'this feature'
}: SubscriptionGateProps) {
  const { user, isSubscribed, subscriptionTier } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (user) {
        try {
          await supabase.functions.invoke('check-subscription');
        } catch (error) {
          console.error('Error checking subscription:', error);
        }
      }
      setChecking(false);
    };

    checkSubscription();
  }, [user]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-primaryStart"></div>
      </div>
    );
  }

  // Check if user has required access
  const hasAccess = isSubscribed && (
    requiredTier === 'basic' || 
    (requiredTier === 'pro' && subscriptionTier === 'pro')
  );

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-neutralBg via-white to-blue-50 bg-[#cfeaff] flex items-center justify-center p-6">
      <Card className="text-center py-8 max-w-2xl w-full">
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
          <Link to="/billing">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              View Plans & Pricing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
