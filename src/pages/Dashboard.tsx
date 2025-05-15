
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useShiftState } from "@/hooks/useShiftState";
import { supabase } from "@/integrations/supabase/client";

// Import components
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardContent from "@/components/dashboard/DashboardContent";
import ShiftManager from "@/components/dashboard/ShiftManager";

// Import utility functions
import { 
  formatDuration, 
  formatCountdown, 
  calculateTimeWorked as calculateTimeWorkedUtil,
  calculateEarnings as calculateEarningsUtil,
  getBreakDuration as getBreakDurationUtil
} from "@/components/dashboard/utils";

const DashboardPage = () => {
  const { user, handleSignOut } = useAuth();
  const [language, setLanguage] = useState("english");
  
  const shiftState = useShiftState();
  const {
    isShiftActive, isBreakActive, isShiftComplete,
    managerName, endManagerName, startTime, endTime, breakStart, totalBreakDuration,
    employerName, payRate, rateType, handleStartShift, handleEndShift,
    setIsBreakActive, setBreakStart, setTotalBreakDuration
  } = shiftState;

  // Log the current state of isStartSignatureOpen from shiftState
  useEffect(() => {
    console.log("📊 Dashboard - shiftState.isStartSignatureOpen:", shiftState.isStartSignatureOpen);
  }, [shiftState.isStartSignatureOpen]);

  // Check authentication state
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // Redirect to login if not authenticated
        window.location.href = "/login";
      }
    };
    
    checkAuth();
  }, []);

  // Utility wrapper functions that use component state
  const calculateTimeWorked = () => 
    calculateTimeWorkedUtil(startTime, endTime, totalBreakDuration);

  const calculateEarnings = () => 
    calculateEarningsUtil(calculateTimeWorked(), payRate, rateType);

  const getBreakDuration = () => 
    getBreakDurationUtil(totalBreakDuration, isBreakActive, breakStart);

  return (
    <DashboardLayout 
      language={language}
      setLanguage={setLanguage}
      handleSignOut={handleSignOut}
    >
      <DashboardContent 
        isShiftActive={isShiftActive}
        isBreakActive={isBreakActive}
        isShiftComplete={isShiftComplete}
        managerName={managerName}
        endManagerName={endManagerName}
        startTime={startTime}
        endTime={endTime}
        breakStart={breakStart}
        totalBreakDuration={totalBreakDuration}
        employerName={employerName}
        payRate={payRate}
        rateType={rateType}
        formatDuration={formatDuration}
        calculateTimeWorked={calculateTimeWorked}
        getBreakDuration={getBreakDuration}
        calculateEarnings={calculateEarnings}
        handleStartShift={() => {
          console.log("📱 Dashboard - handleStartShift button clicked");
          handleStartShift();
        }}
        handleEndShift={handleEndShift}
        setIsBreakActive={setIsBreakActive}
        setBreakStart={setBreakStart}
        setTotalBreakDuration={setTotalBreakDuration}
      />

      <ShiftManager 
        userId={user?.id}
        startTime={startTime}
        formatDuration={formatDuration}
        calculateTimeWorked={calculateTimeWorked}
        getBreakDuration={getBreakDuration}
      />
    </DashboardLayout>
  );
};

export default DashboardPage;
