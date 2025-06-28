// src/hooks/useShiftState.ts

import { useState } from "react";
// ↓ comment this out
// import { useShiftPersistence } from "./shift/useShiftPersistence";
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
  
  // Manager and signature
  const [managerName, setManagerName]       = useState("");
  const [endManagerName, setEndManagerName] = useState("");
  const [startSignatureData, setStartSignatureData] = useState<string|null>(null);
  const [endSignatureData,   setEndSignatureData]   = useState<string|null>(null);
  
  // Timing
  const [startTime, setStartTime]                 = useState<Date|null>(null);
  const [endTime,   setEndTime]                   = useState<Date|null>(null);
  const [breakStart, setBreakStart]               = useState<Date|null>(null);
  const [totalBreakDuration, setTotalBreakDuration] = useState(0);
  
  // Billing fields
  const [employerName, setEmployerName] = useState("");
  const [payRate,       setPayRate]     = useState(15);
  const [rateType,      setRateType]    = useState<RateType>("Per Hour");

  // Validation
  const validation = useShiftValidation();
  
  // ── PERSISTENCE DISABLED ──
//  useShiftPersistence(
//    isShiftActive,
//    isBreakActive,
//    startTime,
//    breakStart,
//    totalBreakDuration,
//    managerName,
//    employerName,
//    payRate,
//    rateType,
//    startSignatureData,
//    setIsShiftActive,
//    setManagerName,
//    setEmployerName,
//    setPayRate,
//    setRateType,
//    setStartSignatureData,
//    validation.setIsStartSignatureEmpty,
//    setStartTime,
//    setIsBreakActive,
//    setTotalBreakDuration,
//    setBreakStart
//  );
  
  // Actions
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
    setTotalBreakDuration,
    setBreakStart,
    setIsBreakActive,
    isBreakActive,
    breakStart,
    totalBreakDuration,
    startTime,
    payRate,
    rateType,
    startSignatureData,
    endSignatureData
  );

  // Break toggle
  const handleBreakToggle = () => {
    if (isBreakActive) actions.handleEndBreak();
    else             actions.handleStartBreak();
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
    isEndSignatureEmpty:   validation.isEndSignatureEmpty,
    showValidationAlert:   validation.showValidationAlert,
    validationType:        validation.validationType,

    // Setters
    setIsShiftActive,
    setManagerName,
    setEndManagerName,
    setIsStartSignatureEmpty: validation.setIsStartSignatureEmpty,
    setIsEndSignatureEmpty:   validation.setIsEndSignatureEmpty,
    setShowValidationAlert:   validation.setShowValidationAlert,
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
    handleStartShift:  actions.handleStartShift,
    handleEndShift:    actions.handleEndShift,
    handleBreakToggle,
    confirmShiftStart: actions.confirmShiftStart,
    confirmShiftEnd:   actions.confirmShiftEnd,
  };
}
