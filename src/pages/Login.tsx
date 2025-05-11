
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50 px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Log In</h1>
          <p className="mt-2 text-gray-600">Welcome back to Clock Work AI</p>
        </div>
        
        {/* This is a placeholder for the login form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-center mb-4">This is a placeholder login page.</p>
          <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
            <Link to="/welcome">Back to Welcome</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
