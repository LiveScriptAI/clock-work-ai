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

    // Save running shift
    save("currentShift", {
      startTime: now.toISOString(),
      managerName,
      employerName,
      payRate,
      rateType,
      startSignatureData
    });

    toast.success("Shift started successfully!");
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

    const end = new Date();
    const cs = load<any>("currentShift") || {};
    const start = startTime || end;

    // Compute hours and earnings
    const workedMs = end.getTime() - new Date(start).getTime();
    const hoursWorked = parseFloat(((workedMs / 1000 / 3600)).toFixed(2));
    const earnings   = parseFloat((hoursWorked * payRate).toFixed(2));

    // Build record
    const record = {
      id:        `shift_${Date.now()}`,
      date:      start,
      employer:  employerName,
      startTime: start,
      endTime:   end,
      breakDuration: 0,          // no breaks
      hoursWorked,
      earnings,
      payRate,
      payType:   rateType,
      status:    "Unpaid",
      managerStart: cs.managerName,
      managerEnd:   endManagerName,
      signatureStart: startSignatureData,
      signatureEnd:   endSignatureData,
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

    // Tear down
    save("currentShift", null);
    setEndTime(end);
    setIsShiftComplete(true);
    setIsEndSignatureOpen(false);

    clearShiftState();

    toast.success("Shift ended & saved to history!");
  };

  return {
    handleStartShift,
    confirmShiftStart,
    handleEndShift,
    confirmShiftEnd
  };
}
