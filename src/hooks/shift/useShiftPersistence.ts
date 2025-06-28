// src/hooks/shift/useShiftPersistence.ts

import { useEffect } from "react";
import { loadShiftState, clearShiftState, clearBreakState } from "@/services/storageService";
import { load, save } from "@/services/localStorageService";
import { toast } from "sonner";
import { differenceInSeconds } from "date-fns";

export function useShiftPersistence(
  isShiftActive: boolean,
  isBreakActive: boolean,
  startTime: Date | null,
  breakStart: Date | null,
  totalBreakDuration: number,
  managerName: string,
  employerName: string,
  payRate: number,
  rateType: string,
  startSignatureData: string | null,
  setIsShiftActive: (v: boolean) => void,
  setManagerName: (v: string) => void,
  setEmployerName: (v: string) => void,
  setPayRate: (v: number) => void,
  setRateType: (v: any) => void,
  setStartSignatureData: (v: string | null) => void,
  setIsStartSignatureEmpty: (v: boolean) => void,
  setStartTime: (v: Date | null) => void,
  setIsBreakActive: (v: boolean) => void,
  setTotalBreakDuration: (v: number) => void,
  setBreakStart: (v: Date | null) => void
) {
  // On mount: restore any in-progress shift
  useEffect(() => {
    const saved = loadShiftState();
    console.log("⏳ useShiftPersistence: loadShiftState →", saved);

    if (saved?.isShiftActive) {
      setIsShiftActive(true);
      setManagerName(saved.managerName);
      setEmployerName(saved.employerName);
      setPayRate(saved.payRate);
      setRateType(saved.rateType);
      setStartSignatureData(saved.startSignatureData);
      setStartSignatureEmpty(false);

      if (saved.startTime) {
        setStartTime(new Date(saved.startTime));
      }
      if (saved.isBreakActive && saved.breakStart) {
        setIsBreakActive(true);
        setBreakStart(new Date(saved.breakStart));
      }
      setTotalBreakDuration(saved.totalBreakDuration);

      toast.info("Restored active shift from previous session");
    }
  }, []);

  // Persist whenever shift is active
  useEffect(() => {
    if (!isShiftActive) return;

    const shiftState = {
      isShiftActive,
      isBreakActive,
      startTime: startTime?.toISOString() || null,
      breakStart: breakStart?.toISOString() || null,
      totalBreakDuration,
      managerName,
      employerName,
      payRate,
      rateType,
      startSignatureData
    };
    console.log("💾 useShiftPersistence: saving state →", shiftState);
    save("currentShift", shiftState);
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
    startSignatureData
  ]);
}
