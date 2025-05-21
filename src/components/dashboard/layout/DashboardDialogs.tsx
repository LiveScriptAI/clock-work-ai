
import React from "react";
import StartShiftDialog from "@/components/dashboard/StartShiftDialog";
import EndShiftDialog from "@/components/dashboard/EndShiftDialog";
import ValidationAlert from "@/components/dashboard/ValidationAlert";

interface DashboardDialogsProps {
  // Shift state
  isStartSignatureOpen: boolean;
  isEndSignatureOpen: boolean;
  managerName: string;
  endManagerName: string;
  employerName: string;
  payRate: number;
  rateType: string;
  startTime: Date | null;
  isStartSignatureEmpty: boolean;
  isEndSignatureEmpty: boolean;
  showValidationAlert: boolean;
  validationType: 'start' | 'end';
  
  // Functions
  setIsStartSignatureOpen: (value: boolean) => void;
  setIsEndSignatureOpen: (value: boolean) => void;
  setManagerName: (value: string) => void;
  setEndManagerName: (value: string) => void;
  setIsStartSignatureEmpty: (value: boolean) => void;
  setIsEndSignatureEmpty: (value: boolean) => void;
  setShowValidationAlert: (value: boolean) => void;
  confirmShiftStart: () => void;
  handleConfirmShiftEnd: () => void;
  setEmployerName: (value: string) => void;
  setPayRate: (value: number) => void;
  setRateType: (value: string) => void;
  setStartSignatureData: (value: string | null) => void;
  setEndSignatureData: (value: string | null) => void;
  
  // Utility functions
  formatDuration: (seconds: number) => string;
  calculateTimeWorked: () => number;
  getBreakDuration: () => string;
}

const DashboardDialogs: React.FC<DashboardDialogsProps> = ({
  isStartSignatureOpen,
  isEndSignatureOpen,
  managerName,
  endManagerName,
  employerName,
  payRate,
  rateType,
  startTime,
  isStartSignatureEmpty,
  isEndSignatureEmpty,
  showValidationAlert,
  validationType,
  setIsStartSignatureOpen,
  setIsEndSignatureOpen,
  setManagerName,
  setEndManagerName,
  setIsStartSignatureEmpty,
  setIsEndSignatureEmpty,
  setShowValidationAlert,
  confirmShiftStart,
  handleConfirmShiftEnd,
  setEmployerName,
  setPayRate,
  setRateType,
  setStartSignatureData,
  setEndSignatureData,
  formatDuration,
  calculateTimeWorked,
  getBreakDuration,
}) => {
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
        setRateType={setRateType}
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

export default DashboardDialogs;
