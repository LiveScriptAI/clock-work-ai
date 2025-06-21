import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Zap } from "lucide-react";

interface TrialSetupProps {
  onTrialStarted: () => void;
}

export function TrialSetup({ onTrialStarted }: TrialSetupProps) {
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  const startTrial = async () => {
    setIsStartingTrial(true);
    
    try {
      console.log('Starting trial setup...');
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session found');
      }

      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke("create-checkout-session", {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({}),
      });

      if (checkoutError) {
        console.error('Checkout error:', checkoutError);
        throw checkoutError;
      }

      if (!checkoutData?.url) {
        throw new Error("No checkout URL received");
      }

      console.log('Checkout session created successfully:', checkoutData.url);
      
      // Open Stripe checkout in new tab
      const win = window.open(checkoutData.url, "_blank");
      if (!win) {
        toast.error("Popup blocked. Please allow popups and try again.");
        setIsStartingTrial(false);
        return;
      }
      
      toast.success("Redirecting to Stripe checkout...");
      
      // Keep the loading state until they return from Stripe
      
    } catch (error) {
      console.error('Trial setup failed:', error);
      toast.error(`Failed to start trial: ${error.message}`);
      setIsStartingTrial(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-brand-accent rounded-full flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-brand-navy" />
          </div>
          <CardTitle className="text-2xl font-display text-brand-navy">
            Start Your Free Trial
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Get 7 days free, then £3.99/month. Cancel anytime.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">What's included:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Track unlimited shifts and breaks</li>
              <li>• Generate professional invoices</li>
              <li>• Export timesheets</li>
              <li>• Real-time earnings calculator</li>
            </ul>
          </div>
          
          <Button 
            onClick={startTrial}
            disabled={isStartingTrial}
            className="w-full bg-brand-accent text-brand-navy font-semibold rounded-full shadow-lg hover:opacity-90 transition"
            size="lg"
          >
            {isStartingTrial ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up trial...
              </>
            ) : (
              "Start 7-Day Free Trial"
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            No charges for 7 days. We'll send a reminder before your trial ends.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
