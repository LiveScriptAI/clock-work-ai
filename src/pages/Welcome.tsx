
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  CalendarDays, 
  DollarSign, 
  MapPin, 
  Star, 
  Mail 
} from "lucide-react";

const WelcomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 px-6 py-12">
      {/* App Header */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Clock Work AI
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Your personal time and shift manager
          </p>
        </div>

        {/* App Icon/Logo Placeholder */}
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg mb-4">
          <Clock className="w-12 h-12 text-white" strokeWidth={1.5} />
        </div>

        {/* Features List */}
        <div className="w-full max-w-xs space-y-4 mt-8">
          <h2 className="text-xl font-semibold text-gray-800">Key Features</h2>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 bg-white rounded-lg shadow-sm">
              <div className="p-2 rounded-full bg-blue-100">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-700">Track your hours and breaks</span>
            </div>
            
            <div className="flex items-center space-x-3 p-2 bg-white rounded-lg shadow-sm">
              <div className="p-2 rounded-full bg-purple-100">
                <CalendarDays className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-gray-700">Automatically generate timesheets</span>
            </div>
            
            <div className="flex items-center space-x-3 p-2 bg-white rounded-lg shadow-sm">
              <div className="p-2 rounded-full bg-green-100">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-700">Calculate your weekly/monthly pay</span>
            </div>
            
            <div className="flex items-center space-x-3 p-2 bg-white rounded-lg shadow-sm">
              <div className="p-2 rounded-full bg-red-100">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-gray-700">Share your live location during shifts</span>
            </div>
            
            <div className="flex items-center space-x-3 p-2 bg-white rounded-lg shadow-sm">
              <div className="p-2 rounded-full bg-indigo-100">
                <Star className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-gray-700">AI assistant for planning shifts</span>
            </div>
            
            <div className="flex items-center space-x-3 p-2 bg-white rounded-lg shadow-sm">
              <div className="p-2 rounded-full bg-teal-100">
                <Mail className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-gray-700">Send work logs via email or WhatsApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="mt-8 space-y-3 w-full">
        <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-6">
          <Link to="/register">Create Account</Link>
        </Button>
        
        <Button asChild variant="outline" className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium py-6">
          <Link to="/login">Log In</Link>
        </Button>
      </div>
    </div>
  );
};

export default WelcomePage;
