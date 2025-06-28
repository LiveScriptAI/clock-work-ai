import { toast } from "sonner";
import { differenceInSeconds } from "date-fns";
import { clearShiftState, clearBreakState } from "@/services/storageService";
import { load, save } from "@/services/localStorageService";
import { ShiftActions } from "./shiftTypes";

/**
 * Manages start/end shift, persisting completed shifts in localStorage
 * and fully clearing the “ongoing” shift state so the UI resets properly.
 */
export function useShiftActions(
  setIsStartSignatureOpen: (v: boolean) => void,
  setIsEndSignatureOpen: (v: boolean) => void,
  isStartSignatureEmpty: boolean,
  isEndSignatureEmpty: boolean,
  managerName: string,
  endManagerName: string,
  employerName: string,
  setShowValidationAlert: (v: boolean) => void,
  setValidationType: (v: "start" | "end") => void,
  setIsShiftActive: (v: boolean) => void,
  setStartTime: (d: Date | null) => void,
  setIsShiftComplete: (v: boolean) => void,
  setEndTime: (d: Date | null) => void,
  setTotalBreakDuration: (n: number) => void,
  setBreakStart: (d: Date | null) => void,
  setIsBreakActive: (v: boolean) => void,
  isBreakActive: boolean,
  breakStart: Date | null,
  totalBreakDuration: number,
  startTime: Date | null,
  payRate: number,
  rateType: string,
  startSignatureData: string | null,
  endSignatureData: string | null
): ShiftActions {

  // --- Start shift ---
  const handleStartShift = () => setIsStartSignatureOpen(true);
  const confirmShiftStart = () => {
    if (isStartSignatureEmpty || !managerName.trim()) {
      setValidationType("start");
      setShowValidationAlert(true);
      return;
    }
    setIsStartSignatureOpen(false);
    setIsShiftActive(true);
    setStartTime(new Date());
    setIsShiftComplete(false);
    // wipe any leftover end/break
    setEndTime(null);
    setTotalBreakDuration(0);
    setBreakStart(null);
    setIsBreakActive(false);
    toast.success("Shift started");
  };

  // --- End shift ---
  const handleEndShift = () => setIsEndSignatureOpen(true);
  const confirmShiftEnd = () => {
    if (isEndSignatureEmpty || !endManagerName.trim()) {
      setValidationType("end");
      setShowValidationAlert(true);
      return;
    }

    // wrap up any active break
    let finalBreak = totalBreakDuration;
    if (isBreakActive && breakStart) {
      finalBreak += differenceInSeconds(new Date(), breakStart);
      setBreakStart(null);
      setIsBreakActive(false);
    }

    const end = new Date();
    setEndTime(end);

    // calculate worked time & pay
    const rawSeconds = startTime
      ? differenceInSeconds(end, startTime) - finalBreak
      : 0;
    const hoursWorked = parseFloat((rawSeconds / 3600).toFixed(2));
    const earnings = parseFloat((hoursWorked * payRate).toFixed(2));

    // build the record
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: (startTime || end).toISOString(),
      employer: employerName,
      startTime: (startTime || end).toISOString(),
      endTime: end.toISOString(),
      breakDuration: finalBreak,
      hoursWorked,
      earnings,
      payRate,
      payType: rateType,
      status: "Completed",
      managerStart: managerName,
      managerEnd: endManagerName,
      signatureStart: startSignatureData,
      signatureEnd: endSignatureData
    };

    // append to history
    try {
      const existing = load<any[]>("shiftsHistory") || [];
      save("shiftsHistory", [...existing, record]);
      toast.success("Shift ended & saved locally");
    } catch (e) {
      console.error("Error saving shift history:", e);
      toast.error("Could not save shift");
    }

    // --- remove the “ongoing” shift so persistence won’t reload it ---
    try {
      window.localStorage.removeItem("currentShift");
    } catch (e) {
      console.warn("Could not remove currentShift:", e);
    }

    // completely clear any in-progress state
    save("shifts", []);        // drop any stored ongoing shift
    save("breaks", []);        // drop break intervals
    clearShiftState();         // your existing cleanup
    clearBreakState();

    // reset UI
    setIsEndSignatureOpen(false);
    setIsShiftActive(false);
    setIsShiftComplete(true);
  };

  return {
    handleStartShift,
    confirmShiftStart,
    handleEndShift,
    confirmShiftEnd
  };
}
