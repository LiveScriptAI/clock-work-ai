import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const EmailVerificationPage = () => {
  return <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-6 font-body">
      <div className="flex flex-col items-center max-w-md w-full">
        {/* Logo */}
        <div className="mb-8">
          <img src="/lovable-uploads/5e5ad164-5fad-4fa8-8d19-cbccf2382c0e.png" alt="Clock Work Pal logo" className="w-56 h-auto mx-auto" />
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-display text-brand-navy">
              Email Verification Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-brand-navy mb-4 text-lg">Follow these simple steps:</h3>
                <ol className="text-left space-y-3 text-sm text-brand-navy">
                  <li className="flex items-start">
                    <span className="bg-brand-accent text-brand-navy rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                    <span>Open your inbox and find the email titled “Confirm Your Signup.”</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-brand-accent text-brand-navy rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                    <span>Click the verification link in that message. You’ll then be taken back to the home page.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-brand-accent text-brand-navy rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                    <span>On the home page, click the “7 Day Free Trial” (as shown below) to begin your free trial.</span>
                  </li>
                  <li className="flex items-start">
                    
                    
                  </li>
                </ol>
              </div>

              {/* Trial Image moved to step 4 position */}
              <div className="flex justify-center">
                <img src="/lovable-uploads/90e6bdbe-5dfb-4b07-ad8d-434598f6bdcd.png" alt="7 Day Free Trial" className="w-64 h-auto rounded-lg shadow-md" />
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-brand-navy">
                  <strong>✓ No credit card required for the trial</strong><br />
                  <strong>✓ Cancel anytime during the trial period</strong><br />
                  <strong>✓ Full access to all Clock Work Pal features</strong>
                </p>
              </div>
            </div>
            
            <div className="text-center pt-4 border-t border-gray-200">
              <Link to="/welcome" className="text-brand-navy text-sm hover:underline font-body block">
                Return to Home Page
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default EmailVerificationPage;