import { toast } from "sonner";
import { differenceInSeconds } from "date-fns";
import { load, save } from "@/services/localStorageService";
import { clearShiftState, clearBreakState } from "@/services/storageService";
import { ShiftActions } from "./shiftTypes";

/**
 * Manages start/end shift, persisting completed shifts in localStorage
 * and fully clearing the “ongoing” state so the buttons reset.
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

  // 1) Start shift
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
    // clear any leftover end/break
    setEndTime(null);
    setTotalBreakDuration(0);
    setBreakStart(null);
    setIsBreakActive(false);
    toast.success("Shift started");
  };

  // 2) End shift
  const handleEndShift = () => setIsEndSignatureOpen(true);
  const confirmShiftEnd = () => {
    if (isEndSignatureEmpty || !endManagerName.trim()) {
      setValidationType("end");
      setShowValidationAlert(true);
      return;
    }

    // finish any running break
    let finalBreak = totalBreakDuration;
    if (isBreakActive && breakStart) {
      finalBreak += differenceInSeconds(new Date(), breakStart);
      setBreakStart(null);
      setIsBreakActive(false);
    }

    const end = new Date();
    setEndTime(end);

    // compute worked time & earnings
    const rawSeconds = startTime
      ? differenceInSeconds(end, startTime) - finalBreak
      : 0;
    const hoursWorked = parseFloat((rawSeconds / 3600).toFixed(2));
    const earnings = parseFloat((hoursWorked * payRate).toFixed(2));

    // build the shift record
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

    // FULLY clear the in-progress state so UI resets—even after reload
    // This ensures useShiftState / useTimesheetLog won’t re-detect an active shift
    save("shifts", []);        // clear any stored “ongoing” shift
    save("breaks", []);        // clear any break intervals
    clearShiftState();         // your existing cleanup
    clearBreakState();

    // update UI
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
