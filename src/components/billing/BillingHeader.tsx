
import React from 'react';

interface BillingHeaderProps {
  isSubscribed: boolean;
}

export function BillingHeader({ isSubscribed }: BillingHeaderProps) {
  return (
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
  );
}
