
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const { isSubscribed, subscriptionTier } = useAuth();

  // Check if user has required access
  const hasAccess = isSubscribed && (
    requiredTier === 'basic' || 
    (requiredTier === 'pro' && subscriptionTier === 'pro')
  );

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <Card className="text-center py-8">
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
            View Plans
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
