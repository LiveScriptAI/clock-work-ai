
import React, { useState } from "react";
import { useShiftState } from "@/hooks/useShiftState";
import { useAuth } from "@/hooks/useAuth";

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
  const [sheetOpen, setSheetOpen] = useState(false);
  const { user } = useAuth();
  
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
