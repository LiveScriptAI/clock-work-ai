
import { useEffect } from "react";
import { saveShiftState, loadShiftState } from "@/services/storageService";
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
  setIsShiftActive: (value: boolean) => void,
  setManagerName: (value: string) => void,
  setEmployerName: (value: string) => void,
  setPayRate: (value: number) => void,
  setRateType: (value: any) => void,
  setStartSignatureData: (value: string | null) => void,
  setIsStartSignatureEmpty: (value: boolean) => void,
  setStartTime: (value: Date | null) => void,
  setIsBreakActive: (value: boolean) => void,
  setTotalBreakDuration: (value: number) => void,
  setBreakStart: (value: Date | null) => void
) {
  // Load saved state on component mount
  useEffect(() => {
    const savedState = loadShiftState();
    if (savedState) {
      const now = new Date();

      // Restore shift state
      if (savedState.isShiftActive) {
        setIsShiftActive(true);
        setManagerName(savedState.managerName);
        setEmployerName(savedState.employerName);
        setPayRate(savedState.payRate);
        setRateType(savedState.rateType);
        setStartSignatureData(savedState.startSignatureData);
        setIsStartSignatureEmpty(false);

        // Restore timestamps
        if (savedState.startTime) {
          const parsedStartTime = new Date(savedState.startTime);
          setStartTime(parsedStartTime);
        }

        // Restore break state
        setIsBreakActive(savedState.isBreakActive);
        setTotalBreakDuration(savedState.totalBreakDuration);

        if (savedState.isBreakActive && savedState.breakStart) {
          const parsedBreakStart = new Date(savedState.breakStart);
          setBreakStart(parsedBreakStart);
          
          // Calculate elapsed break time since app was closed
          if (parsedBreakStart) {
            const elapsedBreakSeconds = differenceInSeconds(now, parsedBreakStart);
            // Fixed: Instead of using a function, calculate and pass the new value directly
            const updatedBreakDuration = savedState.totalBreakDuration + elapsedBreakSeconds;
            setTotalBreakDuration(updatedBreakDuration);
            // Reset break start time to now
            setBreakStart(now);
          }
        }

        toast.info("Restored active shift from previous session");
      }
    }
  }, []);

  // Save state whenever relevant values change
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
        startSignatureData
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
    startSignatureData
  ]);
}
