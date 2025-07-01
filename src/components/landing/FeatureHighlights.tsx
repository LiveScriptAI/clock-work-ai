
import React from 'react';
import { Clock, Coffee, MapPin, FileText, Send, CheckSquare } from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: "Clock In / Out",
    description: "Simple one-tap time tracking for all your shifts"
  },
  {
    icon: Coffee,
    title: "Break Tracking",
    description: "Log your breaks automatically with precise timing"
  },
  {
    icon: MapPin,
    title: "GPS Safety Logging",
    description: "Location tracking for safety and verification"
  },
  {
    icon: CheckSquare,
    title: "Manager Sign-Off",
    description: "Digital signatures for shift verification"
  },
  {
    icon: FileText,
    title: "Auto Timesheet Summary",
    description: "Professional timesheets generated automatically"
  },
  {
    icon: Send,
    title: "Export & Share",
    description: "Send via CSV, email, or WhatsApp instantly"
  }
];

const FeatureHighlights = () => {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Track Your Work
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Designed specifically for workers who need reliable, simple time tracking
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <IconComponent className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;
