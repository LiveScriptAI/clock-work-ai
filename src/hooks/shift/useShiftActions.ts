
import { useState } from "react";
import { differenceInSeconds } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  clearShiftState, 
  clearBreakState,
  loadBreakState,
  saveShiftState 
} from "@/services/storageService";
import { 
  calculateTimeWorked as calculateTimeWorkedUtil,
  calculateEarnings as calculateEarningsUtil 
} from "@/components/dashboard/utils";

export function useShiftActions(
  setIsStartSignatureOpen: (value: boolean) => void,
  setIsEndSignatureOpen: (value: boolean) => void,
  isStartSignatureEmpty: boolean,
  isEndSignatureEmpty: boolean,
  managerName: string,
  endManagerName: string,
  employerName: string,
  setShowValidationAlert: (value: boolean) => void,
  setValidationType: (value: string) => void,
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartShift = () => {
    if (!employerName.trim()) {
      setShowValidationAlert(true);
      setValidationType("employer");
      return;
    }
    
    if (!managerName.trim()) {
      setShowValidationAlert(true);
      setValidationType("manager");
      return;
    }
    
    setIsStartSignatureOpen(true);
  };

  const handleEndShift = () => {
    if (!endManagerName.trim()) {
      setShowValidationAlert(true);
      setValidationType("endManager");
      return;
    }
    
    setIsEndSignatureOpen(true);
  };

  const confirmShiftStart = () => {
    if (isStartSignatureEmpty) {
      setShowValidationAlert(true);
      setValidationType("startSignature");
      return;
    }

    setIsStartSignatureOpen(false);
    setIsShiftActive(true);
    setStartTime(new Date());
    toast.success("Shift started successfully!");
  };

  const confirmShiftEnd = async (userId?: string) => {
    if (isEndSignatureEmpty) {
      setShowValidationAlert(true);
      setValidationType("endSignature");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const now = new Date();
      setEndTime(now);
      
      // End any active break
      if (isBreakActive) {
        setIsBreakActive(false);
        if (breakStart) {
          const activeBreakDuration = differenceInSeconds(now, breakStart);
          setTotalBreakDuration(totalBreakDuration + activeBreakDuration);
        }
        setBreakStart(null);
      }

      // Get break intervals from localStorage
      const breakState = loadBreakState();
      console.log("useShiftActions - loaded break state:", breakState);
      
      let breakIntervals: { start: string; end: string | null }[] = [];
      if (breakState?.breakIntervals && Array.isArray(breakState.breakIntervals)) {
        breakIntervals = breakState.breakIntervals.map(interval => ({
          start: interval.start,
          end: interval.end
        }));
        console.log("useShiftActions - processed break intervals:", breakIntervals);
      }

      // Calculate final values
      const finalBreakDuration = breakState?.totalBreakDuration || totalBreakDuration;
      const timeWorkedSeconds = calculateTimeWorkedUtil(startTime, now, finalBreakDuration);
      const timeWorkedHours = timeWorkedSeconds / 3600;
      const earnings = parseFloat(calculateEarningsUtil(timeWorkedSeconds, payRate, rateType));

      console.log("useShiftActions - shift completion data:", {
        timeWorkedSeconds,
        timeWorkedHours,
        finalBreakDuration,
        breakIntervalsCount: breakIntervals.length,
        earnings
      });

      // Save to database with break intervals data
      const { data, error } = await supabase
        .from('shifts')
        .insert({
          user_id: userId,
          start_time: startTime?.toISOString(),
          end_time: now.toISOString(),
          employer_name: employerName,
          manager_start_name: managerName,
          manager_end_name: endManagerName,
          manager_start_signature: startSignatureData,
          manager_end_signature: endSignatureData,
          pay_rate: payRate,
          rate_type: rateType,
          break_duration: Math.round(finalBreakDuration / 60), // Convert to minutes for database
          break_intervals: breakIntervals.length > 0 ? JSON.stringify(breakIntervals) : null,
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("useShiftActions - shift saved to database:", data);

      // Clean up
      setIsEndSignatureOpen(false);
      setIsShiftActive(false);
      setIsShiftComplete(true);
      clearShiftState();
      clearBreakState();

      toast.success("Shift completed and saved successfully!");
    } catch (error) {
      console.error("Error saving shift:", error);
      toast.error("Failed to save shift. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleStartShift,
    handleEndShift,
    confirmShiftStart,
    confirmShiftEnd
  };
}
