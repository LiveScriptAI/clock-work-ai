// src/hooks/useShiftState.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { differenceInSeconds } from "date-fns";
import {
  saveShiftState,
  loadShiftState,
  clearShiftState
} from "@/services/storageService";

export type RateType = "Per Hour" | "Per Day" | "Per Week" | "Per Month";

export interface ShiftState {
  isShiftActive: boolean;
  isBreakActive: boolean;
  isStartSignatureOpen: boolean;
  isEndSignatureOpen: boolean;
  isShiftComplete: boolean;
  managerName: string;
  endManagerName: string;
  startTime: Date | null;
  endTime: Date | null;
  breakStart: Date | null;
  totalBreakDuration: number;
  employerName: string;
  payRate: number;
  rateType: RateType;
  startSignatureData: string | null;
  endSignatureData: string | null;
  isStartSignatureEmpty: boolean;
  isEndSignatureEmpty: boolean;
  showValidationAlert: boolean;
  validationType: "start" | "end";
}

export function useShiftState() {
  // Core shift states
  const [isShiftActive, setIsShiftActive] = useState(false);

  // Restore break state from localStorage
  const storedIsBreakActive = localStorage.getItem("isBreakActive");
  const storedBreakStart = localStorage.getItem("breakStart");

  const [isBreakActive, setIsBreakActive] = useState<boolean>(
    storedIsBreakActive === "true"
  );
  const [breakStart, setBreakStart] = useState<Date | null>(
    storedBreakStart ? new Date(storedBreakStart) : null
  );
  const [isStartSignatureOpen, setIsStartSignatureOpen] = useState(false);
  const [isEndSignatureOpen, setIsEndSignatureOpen] = useState(false);
  const [isShiftComplete, setIsShiftComplete] = useState(false);

  // Manager and signature data
  const [managerName, setManagerName] = useState("");
  const [endManagerName, setEndManagerName] = useState("");
  const [startSignatureData, setStartSignatureData] = useState<string | null>(
    null
  );
  const [endSignatureData, setEndSignatureData] = useState<string | null>(
    null
  );

  // Time tracking states
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [totalBreakDuration, setTotalBreakDuration] = useState(0); // seconds

  // Form state
  const [employerName, setEmployerName] = useState("");
  const [payRate, setPayRate] = useState(15);
  const [rateType, setRateType] = useState<RateType>("Per Hour");

  // Validation states
  const [isStartSignatureEmpty, setIsStartSignatureEmpty] = useState(true);
  const [isEndSignatureEmpty, setIsEndSignatureEmpty] = useState(true);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationType, setValidationType] = useState<"start" | "end">(
    "start"
  );

  // Restore saved shift + break on mount
  useEffect(() => {
    const saved = loadShiftState();
    if (saved?.isShiftActive) {
      const now = new Date();
      setIsShiftActive(true);
      setManagerName(saved.managerName);
      setEmployerName(saved.employerName);
      setPayRate(saved.payRate);
      setRateType(saved.rateType as RateType);
      setStartSignatureData(saved.startSignatureData);
      setIsStartSignatureEmpty(false);

      if (saved.startTime) {
        setStartTime(new Date(saved.startTime));
      }

      // Restore break state
      if (saved.isBreakActive) {
        setIsBreakActive(true);
        setTotalBreakDuration(saved.totalBreakDuration);

        if (saved.breakStart) {
          const parsed = new Date(saved.breakStart);
          // add elapsed seconds
          const elapsed = differenceInSeconds(now, parsed);
          setTotalBreakDuration((prev) => prev + elapsed);
          setBreakStart(now);
        }
      }

      toast.info("Restored active shift from previous session");
    }
  }, []);

  // Persist shift+break state
  useEffect(() => {
    if (isShiftActive) {
      saveShiftState({
        isShiftActive,
        isBreakActive,
        startTime: startTime ? startTime.toISOString() : null,
        breakStart: breakStart ? breakStart.toISOString() : null,
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

  // Persist break fields separately
  useEffect(() => {
    localStorage.setItem("isBreakActive", JSON.stringify(isBreakActive));
  }, [isBreakActive]);

  useEffect(() => {
    if (breakStart) {
      localStorage.setItem("breakStart", breakStart.toISOString());
    } else {
      localStorage.removeItem("breakStart");
    }
  }, [breakStart]);

  // Action handlers
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
    if (isBreakActive && breakStart) {
      const dur = differenceInSeconds(new Date(), breakStart);
      setTotalBreakDuration((prev) => prev + dur);
      setBreakStart(null);
      setIsBreakActive(false);
    }

    const end = new Date();
    setEndTime(end);

    if (startTime && userId) {
      try {
        const { error } = await supabase.from("shifts").insert([
          {
            user_id: userId,
            start_time: startTime.toISOString(),
            end_time: end.toISOString(),
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
        if (error) throw error;
        toast.success("Shift ended and data saved successfully!");
        clearShiftState();
      } catch {
        toast.error("Failed to save shift data. Please try again.");
      }
    }

    setIsEndSignatureOpen(false);
    setIsShiftActive(false);
    setIsShiftComplete(true);
  };

  return {
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

    setIsShiftActive,
    setEmployerName,
    setManagerName,
    setEndManagerName,
    setPayRate,
    setRateType,
    setStartSignatureData,
    setEndSignatureData,
    setIsStartSignatureEmpty,
    setIsEndSignatureEmpty,
    setShowValidationAlert,
    setIsStartSignatureOpen,
    setIsEndSignatureOpen,
    setBreakStart,
    setTotalBreakDuration,
    setIsBreakActive,

    handleStartShift,
    handleEndShift,
    confirmShiftStart,
    confirmShiftEnd,
  };
}

