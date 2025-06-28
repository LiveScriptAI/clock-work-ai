
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

    setIsShiftActive(true);
    setStartTime(new Date());
    setIsStartSignatureOpen(false);
    
    // Persist shift start to localStorage
    const shiftStartData = {
      startTime: new Date().toISOString(),
      managerName,
      employerName,
      payRate,
      rateType,
      startSignatureData,
      isActive: true
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

    // End any active break
    if (isBreakActive) {
      setIsBreakActive(false);
      setBreakStart(null);
    }

    const endTime = new Date();
    setEndTime(endTime);
    setIsShiftComplete(true);
    setIsEndSignatureOpen(false);

    // Generate shift ID for saving breaks
    const shiftId = startTime ? startTime.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    // Save break intervals locally
    try {
      const breakState = loadBreakState();
      if (breakState?.breakIntervals && breakState.breakIntervals.length > 0) {
        // Filter completed intervals (those with both start and end)
        const completedIntervals = breakState.breakIntervals
          .filter(interval => interval.start && interval.end)
          .map(interval => ({
            start: interval.start,
            end: interval.end!
          }));

        if (completedIntervals.length > 0) {
          console.log("ShiftActions - Saving break intervals locally:", completedIntervals);
          save(`breakIntervals_${shiftId}`, completedIntervals);
          
          // Also save to breaks array for persistence
          const existingBreaks = load<any[]>('breaks') || [];
          const newBreak = {
            shiftId,
            intervals: completedIntervals,
            date: new Date().toISOString()
          };
          existingBreaks.push(newBreak);
          save('breaks', existingBreaks);
        }
      }
    } catch (error) {
      console.error("ShiftActions - Error saving break intervals locally:", error);
      toast.error("Failed to save break data");
    }

    // Save completed shift locally
    if (startTime) {
      try {
        const shiftData = {
          id: shiftId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          break_duration: Math.round(totalBreakDuration / 60), // Convert to minutes
          pay_rate: payRate,
          rate_type: rateType,
          employer_name: employerName,
          manager_start_name: managerName,
          manager_end_name: endManagerName,
          manager_start_signature: startSignatureData,
          manager_end_signature: endSignatureData,
          created_at: new Date().toISOString(),
          completed: true
        };

        // Save individual shift
        save(`shift_${shiftId}`, shiftData);
        
        // Add to shifts array for persistence
        const existingShifts = load<any[]>('shifts') || [];
        existingShifts.push(shiftData);
        save('shifts', existingShifts);
        
        console.log('Shift saved successfully locally');
      } catch (error) {
        console.error('Error saving shift locally:', error);
        toast.error("Failed to save shift locally");
      }
    }

    // Clear local storage
    clearShiftState();
    resetBreakState();
    save('currentShift', null); // Clear current active shift
    
    toast.success("Shift ended successfully!");
  };

  return {
    handleStartShift,
    handleEndShift,
    confirmShiftStart,
    confirmShiftEnd,
  };
}
