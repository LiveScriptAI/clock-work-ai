
import { useBreakTime } from "../useBreakTime";
import { saveShift } from "@/services/shiftService";
import { ValidationType } from "./useShiftValidation";

export function useShiftActions(
  setIsStartSignatureOpen: (value: boolean) => void,
  setIsEndSignatureOpen: (value: boolean) => void,
  isStartSignatureEmpty: boolean,
  isEndSignatureEmpty: boolean,
  managerName: string,
  endManagerName: string,
  employerName: string,
  setShowValidationAlert: (value: boolean) => void,
  setValidationType: (value: ValidationType) => void,
  setIsShiftActive: (value: boolean) => void,
  setStartTime: (value: Date | null) => void,
  setIsShiftComplete: (value: boolean) => void,
  setEndTime: (value: Date | null) => void,
  setTotalBreakDuration: (value: number) => void,
  setBreakStart: (value: Date | null) => void,
  setIsBreakActive: (value: boolean) => void,
  isBreakActive: boolean,
  breakStart: Date | null,
  totalBreakDuration: number,
  startTime: Date | null,
  payRate: number,
  rateType: string,
  startSignatureData: string | null,
  endSignatureData: string | null
) {
  const { resetBreakIntervals } = useBreakTime();

  const handleStartShift = () => {
    // Simply open the signature dialog - validation will happen in confirmShiftStart
    setIsStartSignatureOpen(true);
  };

  const handleEndShift = () => {
    // Simply open the signature dialog - validation will happen in confirmShiftEnd
    setIsEndSignatureOpen(true);
  };

  const confirmShiftStart = () => {
    if (!employerName.trim()) {
      setValidationType('employer');
      setShowValidationAlert(true);
      return;
    }
    
    if (!managerName.trim()) {
      setValidationType('manager');
      setShowValidationAlert(true);
      return;
    }
    
    if (isStartSignatureEmpty) {
      setValidationType('startSignature');
      setShowValidationAlert(true);
      return;
    }
    
    const now = new Date();
    setStartTime(now);
    setIsShiftActive(true);
    setIsStartSignatureOpen(false);
    
    // Reset break tracking when starting a new shift
    resetBreakIntervals();
  };

  const confirmShiftEnd = async (userId: string | undefined) => {
    if (!endManagerName.trim()) {
      setValidationType('endManager');
      setShowValidationAlert(true);
      return;
    }
    
    if (isEndSignatureEmpty) {
      setValidationType('endSignature');
      setShowValidationAlert(true);
      return;
    }
    
    const now = new Date();
    setEndTime(now);
    setIsShiftComplete(true);
    setIsEndSignatureOpen(false);
    
    // End any active break
    if (isBreakActive && breakStart) {
      const activeBreakDuration = Math.floor((now.getTime() - breakStart.getTime()) / 1000);
      setTotalBreakDuration(totalBreakDuration + activeBreakDuration);
      setBreakStart(null);
      setIsBreakActive(false);
    }
    
    // Save shift to database if user is available
    if (userId && startTime) {
      try {
        const { breakIntervals } = useBreakTime();
        await saveShift({
          user_id: userId,
          start_time: startTime.toISOString(),
          end_time: now.toISOString(),
          manager_name: managerName,
          end_manager_name: endManagerName,
          employer_name: employerName,
          pay_rate: payRate,
          rate_type: rateType,
          start_signature_data: startSignatureData,
          end_signature_data: endSignatureData,
          break_intervals: breakIntervals.map(interval => ({
            start: interval.start.toISOString(),
            end: interval.end?.toISOString() || now.toISOString()
          }))
        });
        console.log('Shift saved successfully with break intervals:', breakIntervals);
      } catch (error) {
        console.error('Error saving shift:', error);
      }
    }
  };

  return {
    handleStartShift,
    handleEndShift,
    confirmShiftStart,
    confirmShiftEnd,
  };
}
