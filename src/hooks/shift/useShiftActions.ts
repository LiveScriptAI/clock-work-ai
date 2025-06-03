
import { useCallback } from "react";
import { toast } from "sonner";
import { saveShift } from "@/services/shiftService";
import { 
  clearShiftState, 
  clearBreakState,
  saveShiftState,
  StoredShiftState 
} from "@/services/storageService";
import { saveBreakIntervalsForCompletedShift } from "@/services/breakIntervalsService";
import { RateType } from "@/hooks/useShiftState";

export function useShiftActions(
  setIsStartSignatureOpen: (open: boolean) => void,
  setIsEndSignatureOpen: (open: boolean) => void,
  isStartSignatureEmpty: boolean,
  isEndSignatureEmpty: boolean,
  managerName: string,
  endManagerName: string,
  employerName: string,
  setShowValidationAlert: (show: boolean) => void,
  setValidationType: (type: string) => void,
  setIsShiftActive: (active: boolean) => void,
  setStartTime: (time: Date | null) => void,
  setIsShiftComplete: (complete: boolean) => void,
  setEndTime: (time: Date | null) => void,
  setTotalBreakDuration: (duration: number) => void,
  setBreakStart: (time: Date | null) => void,
  setIsBreakActive: (active: boolean) => void,
  isBreakActive: boolean,
  breakStart: Date | null,
  totalBreakDuration: number,
  startTime: Date | null,
  payRate: number,
  rateType: RateType,
  startSignatureData: string | null,
  endSignatureData: string | null
) {
  
  const handleStartShift = useCallback(() => {
    if (!managerName.trim()) {
      setShowValidationAlert(true);
      setValidationType("manager");
      return;
    }
    
    if (!employerName.trim()) {
      setShowValidationAlert(true);
      setValidationType("employer");
      return;
    }
    
    setIsStartSignatureOpen(true);
  }, [managerName, employerName, setShowValidationAlert, setValidationType, setIsStartSignatureOpen]);

  const handleEndShift = useCallback(() => {
    if (!endManagerName.trim()) {
      setShowValidationAlert(true);
      setValidationType("endManager");
      return;
    }
    
    setIsEndSignatureOpen(true);
  }, [endManagerName, setShowValidationAlert, setValidationType, setIsEndSignatureOpen]);

  const confirmShiftStart = useCallback(() => {
    if (isStartSignatureEmpty) {
      setShowValidationAlert(true);
      setValidationType("startSignature");
      return;
    }

    const now = new Date();
    setIsShiftActive(true);
    setStartTime(now);
    setIsShiftComplete(false);
    setIsStartSignatureOpen(false);
    
    toast.success(`Shift started at ${now.toLocaleTimeString()}`);
  }, [
    isStartSignatureEmpty,
    setShowValidationAlert,
    setValidationType,
    setIsShiftActive,
    setStartTime,
    setIsShiftComplete,
    setIsStartSignatureOpen
  ]);

  const confirmShiftEnd = useCallback(async (userId?: string) => {
    if (isEndSignatureEmpty) {
      setShowValidationAlert(true);
      setValidationType("endSignature");
      return;
    }

    if (isBreakActive && breakStart) {
      const now = new Date();
      const additionalBreakTime = Math.floor((now.getTime() - breakStart.getTime()) / 1000);
      setTotalBreakDuration(prev => prev + additionalBreakTime);
      setBreakStart(null);
      setIsBreakActive(false);
    }

    const endTime = new Date();
    setEndTime(endTime);
    setIsShiftActive(false);
    setIsShiftComplete(true);
    setIsEndSignatureOpen(false);

    // Generate shift ID for break intervals
    const shiftId = `current_shift_${Date.now()}`;

    try {
      // Save break intervals to Supabase first
      await saveBreakIntervalsForCompletedShift(shiftId);
      console.log("useShiftActions - Break intervals saved for completed shift");

      // Save shift data if user is available
      if (userId && startTime) {
        const shiftData = {
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          break_duration: Math.floor(totalBreakDuration / 60),
          pay_rate: payRate,
          rate_type: rateType,
          manager_start_name: managerName,
          manager_end_name: endManagerName,
          employer_name: employerName,
          manager_start_signature: startSignatureData,
          manager_end_signature: endSignatureData,
          user_id: userId
        };

        await saveShift(shiftData);
        console.log("useShiftActions - Shift data saved to database");
      }

      // Clear local storage states
      clearShiftState();
      clearBreakState();

      toast.success(`Shift ended at ${endTime.toLocaleTimeString()}`);
      console.log("useShiftActions - Shift completion process finished successfully");
    } catch (error) {
      console.error("useShiftActions - Error during shift completion:", error);
      toast.error("Shift ended but there was an issue saving some data");
    }
  }, [
    isEndSignatureEmpty,
    setShowValidationAlert,
    setValidationType,
    isBreakActive,
    breakStart,
    setTotalBreakDuration,
    setBreakStart,
    setIsBreakActive,
    setEndTime,
    setIsShiftActive,
    setIsShiftComplete,
    setIsEndSignatureOpen,
    totalBreakDuration,
    startTime,
    payRate,
    rateType,
    managerName,
    endManagerName,
    employerName,
    startSignatureData,
    endSignatureData
  ]);

  return {
    handleStartShift,
    handleEndShift,
    confirmShiftStart,
    confirmShiftEnd,
  };
}
