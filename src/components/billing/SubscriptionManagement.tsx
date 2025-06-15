
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown } from 'lucide-react';
import { ManageSubscriptionButton } from '@/components/ManageSubscriptionButton';

interface SubscriptionStatus {
  subscription_status: string | null;
  subscription_tier: string | null;
  stripe_customer_id: string | null;
}

interface SubscriptionManagementProps {
  subscriptionStatus: SubscriptionStatus | null;
}

export function SubscriptionManagement({ subscriptionStatus }: SubscriptionManagementProps) {
  return (
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
  );
}
