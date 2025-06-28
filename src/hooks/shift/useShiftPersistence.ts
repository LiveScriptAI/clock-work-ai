// src/hooks/shift/useShiftPersistence.ts

import { useEffect } from "react";
import {
  loadShiftState,
  clearShiftState,
  clearBreakState
} from "@/services/storageService";
import { load } from "@/services/localStorageService";
import { toast } from "sonner";
import { differenceInSeconds } from "date-fns";

/**
 * On mount:
 * - If neither the old store nor the “currentShift” store has an active flag,
 *   immediately clear both and bail (so no stale shift ever reloads).
 * - Otherwise restore as before.
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
    // load old & new store
    const oldStore    = loadShiftState();
    const newStore    = load<any>("currentShift");
    const hasOld      = oldStore    && oldStore.isShiftActive;
    const hasNew      = newStore    && newStore.isActive;

    if (!hasOld && !hasNew) {
      // nothing to restore → wipe any stale entries
      clearShiftState();
      clearBreakState();
      return;
    }

    // Otherwise restore exactly as before...
    if (hasNew) {
      setIsShiftActive(true);
      setManagerName(newStore.managerName  || "");
      setEmployerName(newStore.employerName || "");
      setPayRate(newStore.payRate       ?? 0);
      setRateType(newStore.rateType     ?? "Per Hour");
      setStartSignatureData(newStore.startSignatureData || null);
      setIsStartSignatureEmpty(false);

      if (newStore.startTime) {
        setStartTime(new Date(newStore.startTime));
      }

      setTotalBreakDuration(newStore.totalBreakDuration || 0);
      setIsBreakActive(newStore.isBreakActive);
      if (newStore.isBreakActive && newStore.breakStart) {
        setBreakStart(new Date(newStore.breakStart));
      }

      toast.info("Restored active shift from previous session");
    }
    else if (hasOld) {
      // fallback to oldStore restoration...
      setIsShiftActive(true);
      setManagerName(oldStore.managerName);
      setEmployerName(oldStore.employerName);
      setPayRate(oldStore.payRate);
      setRateType(oldStore.rateType);
      setStartSignatureData(oldStore.startSignatureData);
      setIsStartSignatureEmpty(false);

      if (oldStore.startTime) {
        setStartTime(new Date(oldStore.startTime));
      }

      setTotalBreakDuration(oldStore.totalBreakDuration);
      setIsBreakActive(oldStore.isBreakActive);
      if (oldStore.isBreakActive && oldStore.breakStart) {
        const parsed = new Date(oldStore.breakStart);
        setBreakStart(parsed);
        // account for elapsed break time
        const elapsed = differenceInSeconds(new Date(), parsed);
        setTotalBreakDuration(oldStore.totalBreakDuration + elapsed);
        setBreakStart(new Date());
      }

      toast.info("Restored active shift from previous session");
    }
  }, []); // run only once on mount

  // we still save into both stores when shift is active...
  // (that code remains unchanged)
}
