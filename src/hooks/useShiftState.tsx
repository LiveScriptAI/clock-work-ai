// src/hooks/useShiftState.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { differenceInSeconds } from "date-fns";
import {
  saveShiftState,
  loadShiftState,
  clearShiftState,
} from "@/services/storageService";

export type RateType = "Per Hour" | "Per Day" | "Per Week" | "Per Month";

export function useShiftState() {
  // Load any previously saved shift/break state
  const saved = loadShiftState();

  // Core shift states
  const [isShiftActive, setIsShiftActive] = useState<boolean>(
    saved?.isShiftActive ?? false
  );

  // Break states: restore from saved or default
  const [isBreakActive, setIsBreakActive] = useState<boolean>(
    saved?.isBreakActive ?? false
  );
  const [breakStart, setBreakStart] = useState<Date | null>(
    saved?.breakStart ? new Date(saved.breakStart) : null
  );
  const [totalBreakDuration, setTotalBreakDuration] = useState<number>(
    saved?.totalBreakDuration ?? 0
  );

  // Signature/dialog state
  const [isStartSignatureOpen, setIsStartSignatureOpen] = useState(false);
  const [isEndSignatureOpen, setIsEndSignatureOpen] = useState(false);
  const [isShiftComplete, setIsShiftComplete] = useState(false);

  // Manager & signature data
  const [managerName, setManagerName] = useState(saved?.managerName ?? "");
  const [endManagerName, setEndManagerName] = useState("");
  const [startSignatureData, setStartSignatureData] = useState<string | null>(
    saved?.startSignatureData ?? null
  );
  const [endSignatureData, setEndSignatureData] = useState<string | null>(null);

  // Time tracking
  const [startTime, setStartTime] = useState<Date | null>(
    saved?.startTime ? new Date(saved.startTime) : null
  );
  const [endTime, setEndTime] = useState<Date | null>(null);

  // Form states
  const [employerName, setEmployerName] = useState(saved?.employerName ?? "");
  const [payRate, setPayRate] = useState<number>(saved?.payRate ?? 15);
  const [rateType, setRateType] = useState<RateType>(
    (saved?.rateType as RateType) ?? "Per Hour"
  );

  // Validation
  const [isStartSignatureEmpty, setIsStartSignatureEmpty] = useState(true);
  const [isEndSignatureEmpty, setIsEndSignatureEmpty] = useState(true);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationType, setValidationType] = useState<"start" | "end">(
    "start"
  );

  //
  // Restore elapsed break time if session resumed after app was closed
  //
  useEffect(() => {
    if (saved?.isBreakActive && saved.breakStart) {
      const now = new Date();
      const elapsed = differenceInSeconds(now, new Date(saved.breakStart));
      setTotalBreakDuration((prev) => prev + elapsed);
      setBreakStart(now);
      toast.info("Resumed break after app restart");
    }
  }, []); // run once

  //
  // Persist entire shift & break state whenever important fields change
  //
  useEffect(() => {
    if (isShiftActive) {
      saveShiftState({
        isShiftActive,
        isBreakActive,
        startTime: startTime?.toISOString() ?? null,
        breakStart: breakStart?.toISOString() ?? null,
        totalBreakDuration,
        managerName,
        employerName,
        payRate,
        rateType,
        startSignatureData,
      });
    }
  }, [
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
  ]);

  //
  // Break control actions
  //
  const handleStartBreak = () => {
    setIsBreakActive(true);
    setBreakStart(new Date());
  };

  const handleEndBreak = () => {
    if (breakStart) {
      const elapsed = differenceInSeconds(new Date(), breakStart);
      setTotalBreakDuration((prev) => prev + elapsed);
    }
    setIsBreakActive(false);
    setBreakStart(null);
  };

  //
  // Shift control actions
  //
  const handleStartShift = () => setIsStartSignatureOpen(true);
  const handleEndShift = () => setIsEndSignatureOpen(true);

  const confirmShiftStart = () => {
    if (isStartSignatureEmpty || !managerName.trim() || !employerName.trim()) {
      setValidationType("start");
      setShowValidationAlert(true);
      return;
    }
    setIsStartSignatureOpen(false);
    setIsShiftActive(true);
    setStartTime(new Date());
    setIsShiftComplete(false);
    setEndTime(null);
    setTotalBreakDuration(0);
    setBreakStart(null);
    setIsBreakActive(false);
    toast.success("Shift started successfully!");
  };

  const confirmShiftEnd = async (userId?: string) => {
    if (isEndSignatureEmpty || !endManagerName.trim()) {
      setValidationType("end");
      setShowValidationAlert(true);
      return;
    }
    // ensure break is ended
    if (isBreakActive) handleEndBreak();

    const currentEnd = new Date();
    setEndTime(currentEnd);

    if (startTime && userId) {
      const { error } = await supabase.from("shifts").insert([
        {
          user_id: userId,
          start_time: startTime.toISOString(),
          end_time: currentEnd.toISOString(),
          break_duration: totalBreakDuration,
          employer_name: employerName,
          pay_rate: payRate,
          rate_type: rateType,
          manager_start_name: managerName,
          manager_end_name: endManagerName,
          manager_start_signature: startSignatureData,
          manager_end_signature: endSignatureData,
        },
      ]);
      if (error) {
        toast.error("Failed to save shift.");
      } else {
        toast.success("Shift ended and saved!");
        clearShiftState();
      }
    }

    setIsEndSignatureOpen(false);
    setIsShiftActive(false);
  };

  return {
    // states
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
    isStartSignatureEmpty,
    isEndSignatureEmpty,
    showValidationAlert,
    validationType,

    // setters
    setIsShiftActive,
    setIsStartSignatureOpen,
    setIsEndSignatureOpen,
    setManagerName,
    setEndManagerName,
    setEmployerName,
    setPayRate,
    setRateType,
    setStartSignatureData,
    setEndSignatureData,
    setIsStartSignatureEmpty,
    setIsEndSignatureEmpty,
    setShowValidationAlert,

    // actions
    handleStartShift,
    handleEndShift,
    handleStartBreak,
    handleEndBreak,
    confirmShiftStart,
    confirmShiftEnd,
  };
}
