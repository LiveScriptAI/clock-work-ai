import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { differenceInSeconds } from "date-fns";
import { clearShiftState, clearBreakState } from "@/services/storageService";
import { ShiftActions } from "./shiftTypes";

export function useShiftActions(
  setIsStartSignatureOpen: (value: boolean) => void,
  setIsEndSignatureOpen: (value: boolean) => void,
  isStartSignatureEmpty: boolean,
  isEndSignatureEmpty: boolean,
  managerName: string,
  endManagerName: string,
  employerName: string,
  setShowValidationAlert: (value: boolean) => void,
  setValidationType: (value: 'start' | 'end') => void,
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
): ShiftActions {
  
  const handleStartShift = () => {
    setIsStartSignatureOpen(true);
  };

  const handleEndShift = () => {
    setIsEndSignatureOpen(true);
  };

  const confirmShiftStart = () => {
    if (isStartSignatureEmpty || !managerName.trim() || !employerName.trim()) {
      setValidationType('start');
      setShowValidationAlert(true);
      return;
    }
    
    setIsStartSignatureOpen(false);
    setIsShiftActive(true);
    setStartTime(new Date());
    setIsShiftComplete(false);
    // Reset any previous shift data
    setEndTime(null);
    setTotalBreakDuration(0);
    setBreakStart(null);
    setIsBreakActive(false);
    toast.success("Shift started successfully!");
  };

  const confirmShiftEnd = async (userId: string | undefined) => {
    if (isEndSignatureEmpty || !endManagerName.trim()) {
      setValidationType('end');
      setShowValidationAlert(true);
      return;
    }
    
    // If still on break, end it and add to total
    if (isBreakActive && breakStart) {
      const breakDuration = differenceInSeconds(new Date(), breakStart);
      // Fixed: Instead of using a function, calculate and pass the new value directly
      const updatedBreakDuration = totalBreakDuration + breakDuration;
      setTotalBreakDuration(updatedBreakDuration);
      setBreakStart(null);
      setIsBreakActive(false);
    }
    
    const currentEndTime = new Date();
    setEndTime(currentEndTime);
    
    // Save to Supabase
    if (startTime && userId) {
      try {
        // Make sure totalBreakDuration is properly calculated before saving
        let finalBreakDuration = totalBreakDuration;
        // Add any active break time to the total if needed
        if (isBreakActive && breakStart) {
          finalBreakDuration += differenceInSeconds(new Date(), breakStart);
        }
        
        const { error } = await supabase
          .from('shifts')
          .insert([
            {
              user_id: userId,
              start_time: startTime.toISOString(),
              end_time: currentEndTime.toISOString(),
              break_duration: finalBreakDuration,
              employer_name: employerName,
              pay_rate: payRate,
              rate_type: rateType,
              manager_start_name: managerName,
              manager_end_name: endManagerName,
              manager_start_signature: startSignatureData,
              manager_end_signature: endSignatureData
            }
          ]);
        
        if (error) {
          console.error('Error saving shift:', error);
          toast.error("Failed to save shift data. Please try again.");
        } else {
          toast.success("Shift ended and data saved successfully!");
          // Clear saved shift state AND break state
          clearShiftState();
          clearBreakState();
        }
      } catch (error) {
        console.error('Exception when saving shift:', error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
    
    setIsEndSignatureOpen(false);
    setIsShiftActive(false);
    setIsShiftComplete(true);
  };

  return {
    handleStartShift,
    handleEndShift,
    confirmShiftStart,
    confirmShiftEnd
  };
}
