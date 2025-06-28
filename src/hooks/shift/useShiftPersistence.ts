
import { useEffect } from "react";
import { saveShiftState, loadShiftState } from "@/services/storageService";
import { save, load } from "@/services/localStorageService";
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
    // Try to load from both old and new storage methods
    const savedState = loadShiftState();
    const currentShift = load<any>('currentShift');
    
    if (currentShift && currentShift.isActive) {
      // Restore from localStorage currentShift
      setIsShiftActive(true);
      setManagerName(currentShift.managerName || '');
      setEmployerName(currentShift.employerName || '');
      setPayRate(currentShift.payRate || 15);
      setRateType(currentShift.rateType || 'Per Hour');
      setStartSignatureData(currentShift.startSignatureData || null);
      setIsStartSignatureEmpty(false);

      if (currentShift.startTime) {
        const parsedStartTime = new Date(currentShift.startTime);
        setStartTime(parsedStartTime);
      }

      toast.info("Restored active shift from previous session");
    } else if (savedState && savedState.isShiftActive) {
      // Fallback to old storage method
      const now = new Date();

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
          const updatedBreakDuration = savedState.totalBreakDuration + elapsedBreakSeconds;
          setTotalBreakDuration(updatedBreakDuration);
          // Reset break start time to now
          setBreakStart(now);
        }
      }

      toast.info("Restored active shift from previous session");
    }
  }, []);

  // Save state whenever relevant values change
  useEffect(() => {
    if (isShiftActive) {
      // Save to both storage methods for compatibility
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

      // Also save to new localStorage method
      const currentShiftData = {
        isActive: isShiftActive,
        startTime: startTime ? startTime.toISOString() : null,
        managerName,
        employerName,
        payRate,
        rateType,
        startSignatureData,
        isBreakActive,
        breakStart: breakStart ? breakStart.toISOString() : null,
        totalBreakDuration
      };
      
      save('currentShift', currentShiftData);
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
