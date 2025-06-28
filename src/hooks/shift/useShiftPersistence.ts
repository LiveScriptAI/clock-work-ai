import { useEffect } from "react";
import { saveShiftState, loadShiftState, clearShiftState, clearBreakState } from "@/services/storageService";
import { save, load } from "@/services/localStorageService";
import { toast } from "sonner";
import { differenceInSeconds } from "date-fns";

/**
 * On mount, tries to restore any in-progress shift & break.
 * If there is none to restore, immediately clears both persisted stores.
 */
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
  useEffect(() => {
    // Load both old & new stores
    const savedState    = loadShiftState();
    const currentShift  = load<any>("currentShift");

    const haveActive =
      (currentShift && currentShift.isActive) ||
      (savedState   && savedState.isShiftActive);

    if (!haveActive) {
      // Nothing to restore → clear any stale state
      clearShiftState();
      clearBreakState();
      return;
    }

    // If we reach here there is an active shift to restore:
    if (currentShift && currentShift.isActive) {
      // Restore from the new store
      setIsShiftActive(true);
      setManagerName(currentShift.managerName  || "");
      setEmployerName(currentShift.employerName || "");
      setPayRate(currentShift.payRate       ?? 0);
      setRateType(currentShift.rateType     ?? "Per Hour");
      setStartSignatureData(currentShift.startSignatureData  || null);
      setIsStartSignatureEmpty(false);

      if (currentShift.startTime) {
        setStartTime(new Date(currentShift.startTime));
      }

      // Rehydrate break info
      if (currentShift.isBreakActive) {
        setIsBreakActive(true);
        if (currentShift.breakStart) {
          setBreakStart(new Date(currentShift.breakStart));
        }
      }
      setTotalBreakDuration(currentShift.totalBreakDuration ?? 0);

      toast.info("Restored active shift from previous session");

    } else if (savedState && savedState.isShiftActive) {
      // Fallback to the old store
      setIsShiftActive(true);
      setManagerName(savedState.managerName);
      setEmployerName(savedState.employerName);
      setPayRate(savedState.payRate);
      setRateType(savedState.rateType);
      setStartSignatureData(savedState.startSignatureData);
      setIsStartSignatureEmpty(false);

      if (savedState.startTime) {
        setStartTime(new Date(savedState.startTime));
      }

      // Break fallback
      setIsBreakActive(savedState.isBreakActive);
      setTotalBreakDuration(savedState.totalBreakDuration);
      if (savedState.isBreakActive && savedState.breakStart) {
        const parsed = new Date(savedState.breakStart);
        setBreakStart(parsed);

        // account for elapsed time since last save
        const now = new Date();
        const elapsed = differenceInSeconds(now, parsed);
        setTotalBreakDuration(savedState.totalBreakDuration + elapsed);
        setBreakStart(now);
      }

      toast.info("Restored active shift from previous session");
    }
  }, []); // run only on mount

  // Always save ongoing shifts into both stores
  useEffect(() => {
    if (!isShiftActive) return;
    // Save to old store
    saveShiftState({
      isShiftActive,
      isBreakActive,
      startTime: startTime?.toISOString() || null,
      breakStart: breakStart?.toISOString()  || null,
      totalBreakDuration,
      managerName,
      employerName,
      payRate,
      rateType,
      startSignatureData
    });

    // Save to new store
    save("currentShift", {
      isActive: isShiftActive,
      employerName,
      managerName,
      payRate,
      rateType,
      startSignatureData,
      isBreakActive,
      breakStart: breakStart?.toISOString()  || null,
      totalBreakDuration,
      // if you track break-intervals array, include that here too
    });
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
