
import React from 'react';
import { Check } from 'lucide-react';

export function TrustIndicators() {
  return (
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
  );
}
