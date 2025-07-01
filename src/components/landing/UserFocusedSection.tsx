
import React from 'react';

const UserFocusedSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Built for Real Workers
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Whether you're tramping cross-country, working night shifts, or juggling agency gigs — 
            Clock Work Pal is here to log your hustle.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
            <div className="space-y-3">
              <div className="text-4xl">🚛</div>
              <h3 className="text-lg font-semibold text-gray-900">HGV Drivers</h3>
              <p className="text-gray-600">Track driving hours, breaks, and compliance</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">📦</div>
              <h3 className="text-lg font-semibold text-gray-900">Warehouse Staff</h3>
              <p className="text-gray-600">Log shifts across different warehouses</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">🏢</div>
              <h3 className="text-lg font-semibold text-gray-900">Agency Workers</h3>
              <p className="text-gray-600">Manage multiple employers and rates</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserFocusedSection;
