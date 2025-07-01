
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              Need help? Contact us at{' '}
              <a 
                href="mailto:support@clockworkpal.com" 
                className="text-blue-600 hover:text-blue-700 underline"
              >
                support@clockworkpal.com
              </a>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500">
            <a href="/privacy-policy" className="hover:text-gray-700 underline">
              Privacy Policy
            </a>
            <span className="hidden sm:inline">•</span>
            <a href="/support" className="hover:text-gray-700 underline">
              Support
            </a>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              © 2025 Interlink Ranking Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
