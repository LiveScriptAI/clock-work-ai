
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "./LoginForm";

interface LoginContainerProps {
  isPaymentFlow: boolean;
}

const LoginContainer = ({ isPaymentFlow }: LoginContainerProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 px-6 font-body">
      <div className="flex flex-col items-center max-w-md w-full">
        {/* Logo */}
        <div className="mb-8 mt-8">
          <img src="/lovable-uploads/5e5ad164-5fad-4fa8-8d19-cbccf2382c0e.png" alt="Clock Work Pal logo" className="w-56 h-auto mx-auto" />
        </div>
        
        {/* Login Form */}
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl font-display text-brand-navy">
              {isPaymentFlow ? "Complete Your Payment" : "Log In"}
            </CardTitle>
            {isPaymentFlow && (
              <p className="text-center text-sm text-gray-600 mt-2">
                Your payment was successful! Please log in to activate your subscription.
              </p>
            )}
          </CardHeader>
          <CardContent className="pb-6">
            <LoginForm isPaymentFlow={isPaymentFlow} />
          </CardContent>
        </Card>
        
        {/* Bottom spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default LoginContainer;
