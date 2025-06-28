import { toast } from "sonner";
import { differenceInSeconds } from "date-fns";
import { clearShiftState, clearBreakState } from "@/services/storageService";
import { load, save } from "@/services/localStorageService";
import { ShiftEntry } from "@/components/dashboard/timesheet/types";
import { ShiftActions } from "./shiftTypes";

/**
 * Handles starting & ending a shift, persisting it into localStorage.
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
  // 1) Starting a shift
  const handleStartShift = () => {
    setIsStartSignatureOpen(true);
  };

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
    // Clear any leftover end/break state
    setEndTime(null);
    setTotalBreakDuration(0);
    setBreakStart(null);
    setIsBreakActive(false);
    toast.success("Shift started");
  };

  // 2) Ending a shift
  const handleEndShift = () => {
    setIsEndSignatureOpen(true);
  };

  const confirmShiftEnd = () => {
    if (isEndSignatureEmpty || !endManagerName.trim()) {
      setValidationType("end");
      setShowValidationAlert(true);
      return;
    }

    // Close out any ongoing break
    let finalBreak = totalBreakDuration;
    if (isBreakActive && breakStart) {
      finalBreak += differenceInSeconds(new Date(), breakStart);
      setBreakStart(null);
      setIsBreakActive(false);
    }

    const end = new Date();
    setEndTime(end);

    // Build the shift record
    const durationSeconds = startTime
      ? differenceInSeconds(end, startTime) - finalBreak
      : 0;
    const hoursWorked = parseFloat((durationSeconds / 3600).toFixed(2));
    const earnings = parseFloat((hoursWorked * payRate).toFixed(2));

    const record: Omit<ShiftEntry, "date"> & { date: string } = {
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

    // Append to localStorage
    try {
      const existing: any[] = load<any[]>("shiftsHistory") || [];
      save("shiftsHistory", [...existing, record]);
      toast.success("Shift ended & saved locally");
    } catch (err) {
      console.error("Local save failed:", err);
      toast.error("Failed to save shift locally");
    }

    // Clear in-progress state
    clearShiftState();
    clearBreakState();

    // Update UI
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
