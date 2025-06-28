import { toast } from "sonner";
import { differenceInSeconds } from "date-fns";
import {
  clearShiftState,
  resetBreakState
} from "@/services/storageService";
import { load, save } from "@/services/localStorageService";
import type { ShiftActions } from "./shiftTypes";

export function useShiftActions(
  setIsStartSignatureOpen: (open: boolean) => void,
  setIsEndSignatureOpen: (open: boolean) => void,
  isStartSignatureEmpty: boolean,
  isEndSignatureEmpty: boolean,
  managerName: string,
  endManagerName: string,
  employerName: string,
  setShowValidationAlert: (show: boolean) => void,
  setValidationType: (type: "start" | "end") => void,
  setIsShiftActive: (active: boolean) => void,
  setStartTime: (time: Date | null) => void,
  setIsShiftComplete: (complete: boolean) => void,
  setEndTime: (time: Date | null) => void,
  setTotalBreakDuration: (duration: number) => void,
  setBreakStart: (start: Date | null) => void,
  setIsBreakActive: (active: boolean) => void,
  // Below values are pulled from the same in-progress shift state:
  isBreakActive: boolean,
  breakStart: Date | null,
  totalBreakDuration: number,
  startTime: Date | null,
  payRate: number,
  rateType: string,
  startSignatureData: string | null,
  endSignatureData: string | null
): ShiftActions {
  // — Shift Start —
  const handleStartShift = () => {
    setIsStartSignatureOpen(true);
  };

  const confirmShiftStart = () => {
    if (isStartSignatureEmpty || !managerName.trim() || !employerName.trim()) {
      setValidationType("start");
      setShowValidationAlert(true);
      return;
    }

    const now = new Date();
    setIsShiftActive(true);
    setStartTime(now);
    setIsStartSignatureOpen(false);

    // Initialize a fresh “currentShift” object
    save("currentShift", {
      isActive: true,
      startTime: now.toISOString(),
      managerName,
      employerName,
      payRate,
      rateType,
      startSignatureData,
      // break state
      isBreakActive: false,
      breakStart: null,
      totalBreakDuration: 0,
      breaks: [] as Array<{
        start: string;
        end: string;
        duration: number;
      }>
    });

    toast.success("Shift started successfully!");
  };

  // — Breaks —
  const handleStartBreak = () => {
    const now = new Date();
    setIsBreakActive(true);
    setBreakStart(now);

    // Update the running shift in localStorage
    const cs = load<any>("currentShift") || {};
    cs.isBreakActive = true;
    cs.breakStart = now.toISOString();
    save("currentShift", cs);

    toast.info("Break started");
  };

  const handleEndBreak = () => {
    if (!breakStart) return;
    const now = new Date();
    const durSec = differenceInSeconds(now, breakStart);

    // Update local state
    setIsBreakActive(false);
    setBreakStart(null);
    setTotalBreakDuration(totalBreakDuration + durSec);

    // Persist into the running shift
    const cs = load<any>("currentShift") || {};
    cs.breaks = cs.breaks || [];
    cs.breaks.push({ start: breakStart.toISOString(), end: now.toISOString(), duration: durSec });
    cs.isBreakActive = false;
    cs.breakStart = null;
    cs.totalBreakDuration = (cs.totalBreakDuration || 0) + durSec;
    save("currentShift", cs);

    toast.success("Break ended");
  };

  // — Shift End —
  const handleEndShift = () => {
    setIsEndSignatureOpen(true);
  };

  const confirmShiftEnd = () => {
    if (isEndSignatureEmpty || !endManagerName.trim()) {
      setValidationType("end");
      setShowValidationAlert(true);
      return;
    }

    // Finish any active break first
    if (isBreakActive && breakStart) {
      handleEndBreak();
    }

    const end = new Date();
    const cs = load<any>("currentShift") || {};
    const start = startTime || end;

    // Compute worked time minus breaks
    const totalSec = differenceInSeconds(end, start);
    const breakSec = cs.totalBreakDuration || 0;
    const workedSec = Math.max(0, totalSec - breakSec);
    const hoursWorked = workedSec / 3600;
    const earnings = hoursWorked * payRate;

    // Build final record
    const record = {
      id:             `shift_${Date.now()}`,
      date:           start,
      employer:       employerName,
      startTime:      start,
      endTime:        end,
      breakDuration:  Math.floor(breakSec / 60),    // minutes
      hoursWorked:    parseFloat(hoursWorked.toFixed(2)),
      earnings:       parseFloat(earnings.toFixed(2)),
      payRate,
      payType:        rateType,
      status:         "Unpaid",
      managerStart:   managerName,
      managerEnd:     endManagerName,
      signatureStart: startSignatureData,
      signatureEnd:   endSignatureData,
      breaks:         cs.breaks || [],              // full intervals
      createdAt:      end.toISOString()
    };

    // Append to history
    const hist = load<any[]>("shiftsHistory") || [];
    hist.push(record);
    save("shiftsHistory", hist);

    // Also maintain the older “shifts” key for backwards compatibility
    const old = load<any[]>("shifts") || [];
    old.push(record);
    save("shifts", old);

    // Tear down the in-progress shift
    save("currentShift", null);
    setEndTime(end);
    setIsShiftComplete(true);
    setIsEndSignatureOpen(false);

    // Completely clear any persisted state
    clearShiftState();
    resetBreakState();

    toast.success("Shift ended & saved to history!");
  };

  return {
    handleStartShift,
    confirmShiftStart,
    handleStartBreak,
    handleEndBreak,
    handleEndShift,
    confirmShiftEnd
  };
}
