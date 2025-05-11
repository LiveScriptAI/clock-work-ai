
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50 px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="mt-2 text-gray-600">Join Clock Work AI today</p>
        </div>
        
        {/* This is a placeholder for the registration form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-center mb-4">This is a placeholder registration page.</p>
          <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
            <Link to="/welcome">Back to Welcome</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
