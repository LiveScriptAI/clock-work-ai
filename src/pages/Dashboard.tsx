
import React, { useState, useEffect } from "react";
import { useShiftState } from "@/hooks/useShiftState";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Loader2 } from "lucide-react";

// Import layout and content components
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import DashboardContent from "@/components/dashboard/layout/DashboardContent";
import DashboardDialogs from "@/components/dashboard/layout/DashboardDialogs";

// Import utility functions
import { 
  formatDuration, 
  formatCountdown, 
  calculateTimeWorked as calculateTimeWorkedUtil,
  calculateEarnings as calculateEarningsUtil
} from "@/components/dashboard/utils";

const DashboardPage = () => {
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { user, isSubscribed, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const shiftState = useShiftState();
  const {
    isShiftActive, isStartSignatureOpen, isEndSignatureOpen, isShiftComplete,
    managerName, endManagerName, startTime, endTime,
    employerName, payRate, rateType, setManagerName, setEndManagerName,
    setIsStartSignatureEmpty, setIsEndSignatureEmpty, showValidationAlert,
    setShowValidationAlert, validationType, setIsStartSignatureOpen, setIsEndSignatureOpen,
    handleStartShift, handleEndShift, confirmShiftStart, confirmShiftEnd,
    setEmployerName, setPayRate, setRateType, setStartSignatureData, setEndSignatureData
  } = shiftState;

  // Show loading screen while checking auth and subscription
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-brand-navy" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Subscription gate - redirect unsubscribed users to billing
  if (!isSubscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-brand-primaryStart to-brand-primaryEnd rounded-full flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-brand-navy">
              Subscription Required
            </CardTitle>
            <CardDescription className="text-lg">
              You need an active subscription to access the dashboard and start tracking your time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/billing')}
              className="w-full bg-gradient-to-r from-brand-primaryStart to-brand-primaryEnd hover:from-brand-primaryStart/90 hover:to-brand-primaryEnd/90"
            >
              Start Your Free Trial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Utility wrapper functions that use component state
  const calculateTimeWorked = () => 
    calculateTimeWorkedUtil(startTime, endTime, 0); // No break duration

  const calculateEarnings = () => 
    calculateEarningsUtil(calculateTimeWorked(), payRate, rateType);

  // Create a wrapper function to call confirmShiftEnd with the user ID
  const handleConfirmShiftEnd = () => {
    confirmShiftEnd(user?.id);
  };

  // Type-safe handler for rate type changes
  const handleRateTypeChange = (value: string) => {
    // Check if value is a valid rate type and cast it
    if (
      value === "Per Hour" ||
      value === "Per Day" ||
      value === "Per Week" ||
      value === "Per Month"
    ) {
      setRateType(value);
    }
  };

  return (
    <DashboardLayout
      sheetOpen={sheetOpen}
      setSheetOpen={setSheetOpen}
    >
      <DashboardContent
        startTime={startTime}
        endTime={endTime}
        isShiftActive={isShiftActive}
        isShiftComplete={isShiftComplete}
        managerName={managerName}
        endManagerName={endManagerName}
        employerName={employerName}
        rateType={rateType}
        payRate={payRate}
        handleStartShift={handleStartShift}
        handleEndShift={handleEndShift}
        formatCountdown={formatCountdown}
        formatDuration={formatDuration}
        calculateTimeWorked={calculateTimeWorked}
        calculateEarnings={calculateEarnings}
      />
      
      <DashboardDialogs
        isStartSignatureOpen={isStartSignatureOpen}
        isEndSignatureOpen={isEndSignatureOpen}
        managerName={managerName}
        endManagerName={endManagerName}
        employerName={employerName}
        payRate={payRate}
        rateType={rateType}
        startTime={startTime}
        isStartSignatureEmpty={shiftState.isStartSignatureEmpty}
        isEndSignatureEmpty={shiftState.isEndSignatureEmpty}
        showValidationAlert={showValidationAlert}
        validationType={validationType}
        setIsStartSignatureOpen={setIsStartSignatureOpen}
        setIsEndSignatureOpen={setIsEndSignatureOpen}
        setManagerName={setManagerName}
        setEndManagerName={setEndManagerName}
        setIsStartSignatureEmpty={setIsStartSignatureEmpty}
        setIsEndSignatureEmpty={setIsEndSignatureEmpty}
        setShowValidationAlert={setShowValidationAlert}
        confirmShiftStart={confirmShiftStart}
        handleConfirmShiftEnd={handleConfirmShiftEnd}
        setEmployerName={setEmployerName}
        setPayRate={setPayRate}
        setRateType={handleRateTypeChange}
        setStartSignatureData={setStartSignatureData}
        setEndSignatureData={setEndSignatureData}
        formatDuration={formatDuration}
        calculateTimeWorked={calculateTimeWorked}
      />
    </DashboardLayout>
  );
};

export default DashboardPage;
