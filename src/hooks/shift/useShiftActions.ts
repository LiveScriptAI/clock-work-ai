import { toast } from "sonner";
import { 
  clearShiftState, 
  clearBreakState, 
  resetBreakState, 
  loadBreakState 
} from "@/services/storageService";
import { save, load } from "@/services/localStorageService";

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
  isBreakActive: boolean,
  breakStart: Date | null,
  totalBreakDuration: number,
  startTime: Date | null,
  payRate: number,
  rateType: string,
  startSignatureData: string | null,
  endSignatureData: string | null
) {
  const handleStartShift = () => {
    setIsStartSignatureOpen(true);
  };

  const handleEndShift = () => {
    setIsEndSignatureOpen(true);
  };

  const handleStartBreak = () => {
    const now = new Date();
    setIsBreakActive(true);
    setBreakStart(now);

    // Save break start to current shift
    const currentShift = load<any>('currentShift') || {};
    currentShift.isBreakActive = true;
    currentShift.breakStart = now.toISOString();
    save('currentShift', currentShift);

    toast.info("Break started");
  };

  const handleEndBreak = () => {
    if (!breakStart) return;

    const now = new Date();
    const breakDuration = Math.floor((now.getTime() - breakStart.getTime()) / 1000); // seconds

    setIsBreakActive(false);
    setBreakStart(null);
    // ← Fixed: pass a number, not a function
    setTotalBreakDuration(totalBreakDuration + breakDuration);

    // Save break to current shift breaks array
    const currentShift = load<any>('currentShift') || {};
    if (!currentShift.breaks) currentShift.breaks = [];

    currentShift.breaks.push({
      start: breakStart.toISOString(),
      end: now.toISOString(),
      duration: breakDuration
    });

    currentShift.isBreakActive = false;
    currentShift.breakStart = null;
    currentShift.totalBreakDuration = (currentShift.totalBreakDuration || 0) + breakDuration;

    save('currentShift', currentShift);
    toast.success("Break ended");
  };

  const confirmShiftStart = () => {
    if (isStartSignatureEmpty) {
      setShowValidationAlert(true);
      setValidationType("start");
      return;
    }

    if (!managerName.trim() || !employerName.trim()) {
      setShowValidationAlert(true);
      setValidationType("start");
      return;
    }

    const now = new Date();
    setIsShiftActive(true);
    setStartTime(now);
    setIsStartSignatureOpen(false);

    // Persist shift start to localStorage
    const shiftStartData = {
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
    save('currentShift', shiftStartData);

    toast.success("Shift started successfully!");
  };

  const confirmShiftEnd = async (userId?: string) => {
    if (isEndSignatureEmpty) {
      setShowValidationAlert(true);
      setValidationType("end");
      return;
    }

    if (!endManagerName.trim()) {
      setShowValidationAlert(true);
      setValidationType("end");
      return;
    }

    // End any active break first
    if (isBreakActive && breakStart) {
      handleEndBreak();
    }

    const endTime = new Date();
    const currentShift = load<any>('currentShift') || {};

    // Calculate total hours worked
    const totalMinutes = startTime
      ? Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60))
      : 0;
    const breakMinutes = Math.floor((currentShift.totalBreakDuration || 0) / 60);
    const workedMinutes = totalMinutes - breakMinutes;
    const hoursWorked = workedMinutes / 60;

    // Create completed shift record
    const completedShift = {
      id: `shift_${Date.now()}`,
      date: startTime || endTime,
      employer: employerName,
      startTime: startTime || endTime,
      endTime: endTime,
      breakDuration: breakMinutes,
      hoursWorked: Math.max(0, hoursWorked),
      earnings: Math.max(0, hoursWorked) * payRate,
      payRate: payRate,
      payType: rateType,
      status: "Unpaid",
      managerStartName: managerName,
      managerEndName: endManagerName,
      startSignature: startSignatureData,
      endSignature: endSignatureData,
      breaks: currentShift.breaks || [],
      createdAt: endTime.toISOString()
    };

    // Save to shifts history
    const shiftsHistory = load<any[]>('shiftsHistory') || [];
    shiftsHistory.push(completedShift);
    save('shiftsHistory', shiftsHistory);

    // Also save for compatibility with other parts of the app
    const existingShifts = load<any[]>('shifts') || [];
    existingShifts.push(completedShift);
    save('shifts', existingShifts);

    // Clear current shift
    save('currentShift', null);

    setEndTime(endTime);
    setIsShiftComplete(true);
    setIsEndSignatureOpen(false);

    // Clear local state
    clearShiftState();
    resetBreakState();

    toast.success("Shift ended and saved to history!");
  };

  return {
    handleStartShift,
    handleEndShift,
    handleStartBreak,
    handleEndBreak,
    confirmShiftStart,
    confirmShiftEnd,
  };
}
