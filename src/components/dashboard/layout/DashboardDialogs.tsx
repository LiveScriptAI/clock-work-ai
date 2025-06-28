import React from "react";
import StartShiftDialog from "./StartShiftDialog";
import EndShiftDialog from "./EndShiftDialog";
import ValidationAlert from "./ValidationAlert";

interface DashboardDialogsProps {
  // Start-Shift dialog
  isStartSignatureOpen: boolean;
  setIsStartSignatureOpen: (open: boolean) => void;
  managerName: string;
  setManagerName: (name: string) => void;
  isStartSignatureEmpty: boolean;
  setIsStartSignatureEmpty: (empty: boolean) => void;
  confirmShiftStart: () => void;
  employerName: string;
  setEmployerName: (name: string) => void;
  payRate: number;
  setPayRate: (rate: number) => void;
  rateType: string;
  setRateType: (type: string) => void;
  setStartSignatureData: (data: string | null) => void;

  // End-Shift dialog
  isEndSignatureOpen: boolean;
  setIsEndSignatureOpen: (open: boolean) => void;
  endManagerName: string;
  setEndManagerName: (name: string) => void;
  isEndSignatureEmpty: boolean;
  setIsEndSignatureEmpty: (empty: boolean) => void;
  handleConfirmShiftEnd: () => void;

  // Utilities for summary display in the dialog
  startTime: Date | null;
  formatDuration: (seconds: number) => string;
  calculateTimeWorked: () => number;

  // Validation alert
  showValidationAlert: boolean;
  setShowValidationAlert: (show: boolean) => void;
  validationType: "start" | "end";
}

const DashboardDialogs: React.FC<DashboardDialogsProps> = ({
  // Start-Shift props
  isStartSignatureOpen,
  setIsStartSignatureOpen,
  managerName,
  setManagerName,
  isStartSignatureEmpty,
  setIsStartSignatureEmpty,
  confirmShiftStart,
  employerName,
  setEmployerName,
  payRate,
  setPayRate,
  rateType,
  setRateType,
  setStartSignatureData,

  // End-Shift props
  isEndSignatureOpen,
  setIsEndSignatureOpen,
  endManagerName,
  setEndManagerName,
  isEndSignatureEmpty,
  setIsEndSignatureEmpty,
  handleConfirmShiftEnd,

  // Utility props
  startTime,
  formatDuration,
  calculateTimeWorked,

  // Validation alert
  showValidationAlert,
  setShowValidationAlert,
  validationType,
}) => (
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
      confirmShiftEnd={handleConfirmShiftEnd}      {/* ← use the real “end” callback */}
      startTime={startTime}
      formatDuration={formatDuration}
      calculateTimeWorked={calculateTimeWorked}
      getBreakDuration={() => "0 min"}              {/* or your real break calcs */}
      setEndSignatureData={setEndSignatureData}
    />

    <ValidationAlert
      showValidationAlert={showValidationAlert}
      setShowValidationAlert={setShowValidationAlert}
      validationType={validationType}
    />
  </>
);

export default DashboardDialogs;
