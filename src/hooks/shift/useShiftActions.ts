
import { toast } from "sonner";
import {
  clearShiftState
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
  startTime: Date | null,
  payRate: number,
  rateType: string,
  startSignatureData: string | null,
  endSignatureData: string | null,
  resetShiftState: () => void
): ShiftActions {
  
  // — Shift Start —
  const handleStartShift = () => {
    console.log("Opening start shift dialog");
    setIsStartSignatureOpen(true);
  };

  const confirmShiftStart = () => {
    console.log("Confirming shift start - validation check");
    
    if (isStartSignatureEmpty || !managerName.trim() || !employerName.trim()) {
      console.log("Validation failed - showing alert");
      setValidationType("start");
      setShowValidationAlert(true);
      return;
    }

    console.log("Validation passed - starting shift");
    const now = new Date();
    
    // Update state first
    setIsShiftActive(true);
    setStartTime(now);
    setIsStartSignatureOpen(false);

    // Save to localStorage
    const currentShiftData = {
      isActive: true,
      startTime: now.toISOString(),
      managerName,
      employerName,
      payRate,
      rateType,
      startSignatureData,
      isBreakActive: false,
      breakStart: null,
      totalBreakDuration: 0,
      breaks: []
    };
    
    save("currentShift", currentShiftData);
    console.log("Shift data saved to localStorage:", currentShiftData);

    toast.success("Shift started successfully!");
  };

  // — Shift End —
  const handleEndShift = () => {
    console.log("Opening end shift dialog");
    setIsEndSignatureOpen(true);
  };

  const confirmShiftEnd = () => {
    console.log("Confirming shift end - validation check");
    
    if (isEndSignatureEmpty || !endManagerName.trim()) {
      setValidationType("end");
      setShowValidationAlert(true);
      return;
    }

    const end = new Date();
    const start = startTime || end;

    // Compute hours and earnings
    const workedMs = end.getTime() - start.getTime();
    const hoursWorked = parseFloat(((workedMs / 1000 / 3600)).toFixed(2));
    const earnings = parseFloat((hoursWorked * payRate).toFixed(2));

    // Build record
    const record = {
      id: `shift_${Date.now()}`,
      date: start,
      employer: employerName,
      startTime: start,
      endTime: end,
      breakDuration: 0,
      hoursWorked,
      earnings,
      payRate,
      payType: rateType,
      status: "Unpaid",
      managerStart: managerName,
      managerEnd: endManagerName,
      signatureStart: startSignatureData,
      signatureEnd: endSignatureData,
      createdAt: end.toISOString()
    };

    // Append to history
    const hist = load<any[]>("shiftsHistory") || [];
    hist.push(record);
    save("shiftsHistory", hist);

    // Back-compat
    const old = load<any[]>("shifts") || [];
    old.push(record);
    save("shifts", old);

    // Clear current shift
    save("currentShift", null);
    
    // Clear shift state (no parameters needed)
    try {
      clearShiftState();
    } catch (error) {
      console.log("Error clearing shift state:", error);
      // Continue anyway since we've already saved the data
    }

    // Dispatch custom event to notify timesheet log to refresh
    window.dispatchEvent(new CustomEvent('shiftCompleted', { 
      detail: { shift: record } 
    }));

    toast.success("Shift ended & saved to history!");

    // Reset all state to allow starting a new shift
    setTimeout(() => {
      resetShiftState();
    }, 100); // Small delay to ensure toast is shown before reset
  };

  return {
    handleStartShift,
    confirmShiftStart,
    handleEndShift,
    confirmShiftEnd
  };
}
