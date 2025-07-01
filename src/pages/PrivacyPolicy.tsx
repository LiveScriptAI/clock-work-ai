
import React from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-8">Last updated: January 1, 2025</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                Clock Work Pal collects information you provide directly to us, such as when you create an account, 
                use our services, or contact us for support.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Personal information (name, email address)</li>
                <li>Work-related data (shift times, break durations, pay rates)</li>
                <li>Location data (when GPS tracking is enabled)</li>
                <li>Device information and usage data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide and maintain our time tracking services</li>
                <li>Generate timesheets and reports</li>
                <li>Improve our app and develop new features</li>
                <li>Communicate with you about our services</li>
                <li>Ensure compliance with labor regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your 
                information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With service providers who assist us in operating our app</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, no method of 
                transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
              <p className="text-gray-700">
                We retain your personal information for as long as necessary to provide our services and comply 
                with legal obligations. You may request deletion of your data at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Delete your personal information</li>
                <li>Object to processing of your data</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Location Data</h2>
              <p className="text-gray-700">
                Our app may collect location data to provide GPS safety logging features. This data is used 
                solely for work verification purposes and is not shared with third parties without your consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700">
                Our service is not intended for children under 16 years of age. We do not knowingly collect 
                personal information from children under 16.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. We will notify you of any changes by 
                posting the new policy on this page and updating the "last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this privacy policy or our data practices, please contact us at:
              </p>
              <p className="text-gray-700 mt-4">
                <strong>Email:</strong>{' '}
                <a href="mailto:support@clockworkpal.com" className="text-blue-600 hover:text-blue-700 underline">
                  support@clockworkpal.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
