
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/7210a4ef-1005-4b91-8781-0fd59a935334.png" 
              alt="Clock Work Pal" 
              className="h-8 w-8"
            />
            <span className="font-bold text-lg text-gray-900">Clock Work Pal</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden sm:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/privacy-policy" 
              className={`text-sm font-medium transition-colors ${
                isActive('/privacy-policy') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Privacy Policy
            </Link>
            <Link 
              to="/support" 
              className={`text-sm font-medium transition-colors ${
                isActive('/support') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Support
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="sm:hidden border-t border-gray-200 py-2">
          <div className="flex flex-col space-y-2">
            <Link 
              to="/" 
              className={`text-sm font-medium px-2 py-1 rounded transition-colors ${
                isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/privacy-policy" 
              className={`text-sm font-medium px-2 py-1 rounded transition-colors ${
                isActive('/privacy-policy') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              Privacy Policy
            </Link>
            <Link 
              to="/support" 
              className={`text-sm font-medium px-2 py-1 rounded transition-colors ${
                isActive('/support') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              Support
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
