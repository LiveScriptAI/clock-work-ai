
import React, { useState, useEffect } from "react";
import { useShiftState } from "@/hooks/useShiftState";
import { useBreakTime } from "@/hooks/useBreakTime";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

// Import layout and content components
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import DashboardContent from "@/components/dashboard/layout/DashboardContent";
import DashboardDialogs from "@/components/dashboard/layout/DashboardDialogs";

// Import utility functions
import { 
  formatDuration, 
  formatCountdown, 
  calculateTimeWorked as calculateTimeWorkedUtil,
  calculateEarnings as calculateEarningsUtil,
  getBreakDuration as getBreakDurationUtil
} from "@/components/dashboard/utils";

const BREAK_DURATIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
];

const DashboardPage = () => {
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const shiftState = useShiftState();
  const {
    isShiftActive, isStartSignatureOpen, isEndSignatureOpen, isShiftComplete,
    managerName, endManagerName, startTime, endTime,
    employerName, payRate, rateType, setManagerName, setEndManagerName,
    setIsStartSignatureEmpty, setIsEndSignatureEmpty, showValidationAlert,
    setShowValidationAlert, validationType, setIsStartSignatureOpen, setIsEndSignatureOpen,
    handleStartShift, handleEndShift, confirmShiftStart, 
    setEmployerName, setPayRate, setRateType, setStartSignatureData, setEndSignatureData
  } = shiftState;

  const breakTime = useBreakTime();
  const {
    isBreakActive,
    breakStart,
    totalBreakDuration,
    remainingBreakTime,
    selectedBreakDuration,
    breakMenuOpen,
    setBreakMenuOpen,
    handleBreakToggle,
    handleBreakDurationChange,
    getCurrentBreakDuration,
    resetBreakStateCompletely
  } = breakTime;

  // Reset break state if shift is not active and break information exists
  useEffect(() => {
    // If shift is not active but we have break data, reset break state
    if (!isShiftActive && !isShiftComplete && (totalBreakDuration > 0 || isBreakActive)) {
      resetBreakStateCompletely();
    }
  }, [isShiftActive, isShiftComplete, totalBreakDuration, isBreakActive, resetBreakStateCompletely]);

  // Utility wrapper functions that use component state
  const calculateTimeWorked = () => 
    calculateTimeWorkedUtil(startTime, endTime, getCurrentBreakDuration());

  const calculateEarnings = () => 
    calculateEarningsUtil(calculateTimeWorked(), payRate, rateType);

  const getBreakDuration = () => 
    getBreakDurationUtil(getCurrentBreakDuration(), isBreakActive, breakStart);

  const handleConfirmShiftEnd = () => {
    shiftState.confirmShiftEnd();
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
      setSheetOpen={setSheetOpen}
      sheetOpen={sheetOpen}
    >
      <DashboardContent
        startTime={startTime}
        endTime={endTime}
        isShiftActive={isShiftActive}
        isShiftComplete={isShiftComplete}
        isBreakActive={isBreakActive}
        managerName={managerName}
        endManagerName={endManagerName}
        breakStart={breakStart}
        remainingBreakTime={remainingBreakTime}
        selectedBreakDuration={selectedBreakDuration}
        breakMenuOpen={breakMenuOpen}
        BREAK_DURATIONS={BREAK_DURATIONS}
        employerName={employerName}
        rateType={rateType}
        payRate={payRate}
        handleStartShift={handleStartShift}
        handleEndShift={handleEndShift}
        handleBreakToggle={handleBreakToggle}
        handleBreakDurationChange={handleBreakDurationChange}
        setBreakMenuOpen={setBreakMenuOpen}
        formatCountdown={formatCountdown}
        getBreakDuration={getBreakDuration}
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
        getBreakDuration={getBreakDuration}
      />
    </DashboardLayout>
  );
};

export default DashboardPage;
