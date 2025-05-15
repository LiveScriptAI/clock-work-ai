
import React, { useEffect } from "react";
import StartShiftDialog from "@/components/dashboard/StartShiftDialog";
import EndShiftDialog from "@/components/dashboard/EndShiftDialog";
import ValidationAlert from "@/components/dashboard/ValidationAlert";
import { useShiftState } from "@/hooks/useShiftState";

interface ShiftManagerProps {
  userId?: string;
  startTime: Date | null;
  formatDuration: (seconds: number) => string;
  calculateTimeWorked: () => number;
  getBreakDuration: () => string;
}

const ShiftManager: React.FC<ShiftManagerProps> = ({
  userId,
  startTime,
  formatDuration,
  calculateTimeWorked,
  getBreakDuration
}) => {
  const {
    isStartSignatureOpen, isEndSignatureOpen, showValidationAlert,
    validationType, managerName, endManagerName,
    setManagerName, setEndManagerName, setIsStartSignatureEmpty, 
    setIsEndSignatureEmpty, setShowValidationAlert, 
    setIsStartSignatureOpen, setIsEndSignatureOpen,
    confirmShiftStart, confirmShiftEnd, 
    employerName, setEmployerName, payRate, setPayRate, 
    rateType, setRateType, setStartSignatureData, setEndSignatureData,
    isStartSignatureEmpty, isEndSignatureEmpty
  } = useShiftState();

  useEffect(() => {
    console.log("🔄 ShiftManager - isStartSignatureOpen:", isStartSignatureOpen);
  }, [isStartSignatureOpen]);

  const handleConfirmShiftEnd = () => {
    confirmShiftEnd(userId);
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
    <>
      <StartShiftDialog 
        isOpen={isStartSignatureOpen}
        onOpenChange={setIsStartSignatureOpen}
        managerName={managerName}
        setManagerName={setManagerName}
        isSignatureEmpty={isStartSignatureEmpty}
        setIsSignatureEmpty={setIsStartSignatureEmpty}
        confirmShiftStart={confirmShiftStart}
        employerName={employerName}
        setEmployerName={setEmployerName}
        payRate={payRate}
        setPayRate={setPayRate}
        rateType={rateType}
        setRateType={handleRateTypeChange}
        setStartSignatureData={setStartSignatureData}
      />

      <EndShiftDialog 
        isOpen={isEndSignatureOpen}
        onOpenChange={setIsEndSignatureOpen}
        endManagerName={endManagerName}
        setEndManagerName={setEndManagerName}
        isSignatureEmpty={isEndSignatureEmpty}
        setIsSignatureEmpty={setIsEndSignatureEmpty}
        confirmShiftEnd={handleConfirmShiftEnd}
        startTime={startTime}
        formatDuration={formatDuration}
        calculateTimeWorked={calculateTimeWorked}
        getBreakDuration={getBreakDuration}
        setEndSignatureData={setEndSignatureData}
      />

      <ValidationAlert 
        showValidationAlert={showValidationAlert}
        setShowValidationAlert={setShowValidationAlert}
        validationType={validationType}
      />
    </>
  );
};

export default ShiftManager;
