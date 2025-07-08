
import { useState } from "react";
import { useShiftPersistence } from "./shift/useShiftPersistence";
import { useShiftValidation } from "./shift/useShiftValidation";
import { useShiftActions } from "./shift/useShiftActions";

export type RateType = "Per Hour" | "Per Day" | "Per Week" | "Per Month";

export function useShiftState() {
  // Core shift states
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [isStartSignatureOpen, setIsStartSignatureOpen] = useState(false);
  const [isEndSignatureOpen, setIsEndSignatureOpen] = useState(false);
  const [isShiftComplete, setIsShiftComplete] = useState(false);
  
  // Manager and signature data
  const [managerName, setManagerName] = useState("");
  const [endManagerName, setEndManagerName] = useState("");
  const [startSignatureData, setStartSignatureData] = useState<string | null>(null);
  const [endSignatureData, setEndSignatureData] = useState<string | null>(null);
  
  // Time tracking states
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [breakStart, setBreakStart] = useState<Date | null>(null);
  const [totalBreakDuration, setTotalBreakDuration] = useState(0); // in seconds
  
  // Form state variables
  const [employerName, setEmployerName] = useState("");
  const [payRate, setPayRate] = useState(15); // Default rate
  const [rateType, setRateType] = useState<RateType>("Per Hour");
  
  // Use our validation hook
  const validation = useShiftValidation();
  
  // Use our persistence hook
  useShiftPersistence(
    isShiftActive,
    isBreakActive,
    startTime,
    breakStart,
    totalBreakDuration,
    managerName,
    employerName,
    payRate,
    rateType,
    startSignatureData,
    setIsShiftActive,
    setManagerName,
    setEmployerName,
    setPayRate,
    setRateType,
    setStartSignatureData,
    validation.setIsStartSignatureEmpty,
    setStartTime,
    setIsBreakActive,
    setTotalBreakDuration,
    setBreakStart
  );
  
  // Complete state reset function
  const resetShiftState = () => {
    setIsShiftActive(false);
    setIsShiftComplete(false);
    setIsBreakActive(false);
    setStartTime(null);
    setEndTime(null);
    setBreakStart(null);
    setTotalBreakDuration(0);
    setManagerName("");
    setEndManagerName("");
    setStartSignatureData(null);
    setEndSignatureData(null);
    setEmployerName("");
    setPayRate(15);
    setRateType("Per Hour");
    validation.setIsStartSignatureEmpty(true);
    validation.setIsEndSignatureEmpty(true);
    validation.setShowValidationAlert(false);
    setIsStartSignatureOpen(false);
    setIsEndSignatureOpen(false);
  };

  // Use our actions hook with all required parameters
  const actions = useShiftActions(
    setIsStartSignatureOpen,
    setIsEndSignatureOpen,
    validation.isStartSignatureEmpty,
    validation.isEndSignatureEmpty,
    managerName,
    endManagerName,
    employerName,
    validation.setShowValidationAlert,
    validation.setValidationType,
    setIsShiftActive,
    setStartTime,
    setIsShiftComplete,
    setEndTime,
    startTime,
    payRate,
    rateType,
    startSignatureData,
    endSignatureData,
    resetShiftState
  );

  // Simple break handlers (no complex break logic)
  const handleStartBreak = () => {
    setIsBreakActive(true);
    setBreakStart(new Date());
    console.log("Break started");
  };

  const handleEndBreak = () => {
    if (breakStart) {
      const now = new Date();
      const breakDuration = Math.floor((now.getTime() - breakStart.getTime()) / 1000);
      setTotalBreakDuration(prev => prev + breakDuration);
    }
    setIsBreakActive(false);
    setBreakStart(null);
    console.log("Break ended");
  };

  const handleBreakToggle = () => {
    if (isBreakActive) {
      handleEndBreak();
    } else {
      handleStartBreak();
    }
  };

  return {
    // State
    isShiftActive,
    isBreakActive,
    isStartSignatureOpen,
    isEndSignatureOpen,
    isShiftComplete,
    managerName,
    endManagerName,
    startTime,
    endTime,
    breakStart,
    totalBreakDuration,
    employerName,
    payRate,
    rateType,
    startSignatureData,
    endSignatureData,
    isStartSignatureEmpty: validation.isStartSignatureEmpty,
    isEndSignatureEmpty: validation.isEndSignatureEmpty,
    showValidationAlert: validation.showValidationAlert,
    validationType: validation.validationType,
    
    // Setters
    setIsShiftActive,
    setManagerName,
    setEndManagerName,
    setIsStartSignatureEmpty: validation.setIsStartSignatureEmpty,
    setIsEndSignatureEmpty: validation.setIsEndSignatureEmpty,
    setShowValidationAlert: validation.setShowValidationAlert,
    setEmployerName,
    setPayRate,
    setRateType,
    setStartSignatureData,
    setEndSignatureData,
    setBreakStart,
    setTotalBreakDuration,
    setIsBreakActive,
    setIsStartSignatureOpen,
    setIsEndSignatureOpen,
    
    // Actions
    handleStartShift: actions.handleStartShift,
    handleEndShift: actions.handleEndShift,
    handleBreakToggle,
    confirmShiftStart: actions.confirmShiftStart,
    confirmShiftEnd: actions.confirmShiftEnd,
    resetShiftState,
  };
}
