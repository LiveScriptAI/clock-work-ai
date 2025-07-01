
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="text-6xl font-bold text-gray-300">404</div>
          <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="space-y-3">
            <Link 
              to="/" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go Home
            </Link>
            <div className="text-sm text-gray-500">
              or{' '}
              <Link to="/support" className="text-blue-600 hover:text-blue-700 underline">
                contact support
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
