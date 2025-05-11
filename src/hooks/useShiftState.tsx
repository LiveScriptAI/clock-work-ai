
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { differenceInSeconds } from "date-fns";

export type RateType = "Per Hour" | "Per Day" | "Per Week" | "Per Month";

export interface ShiftState {
  isShiftActive: boolean;
  isBreakActive: boolean;
  isStartSignatureOpen: boolean;
  isEndSignatureOpen: boolean;
  isShiftComplete: boolean;
  managerName: string;
  endManagerName: string;
  startTime: Date | null;
  endTime: Date | null;
  breakStart: Date | null;
  totalBreakDuration: number;
  employerName: string;
  payRate: number;
  rateType: RateType;
  startSignatureData: string | null;
  endSignatureData: string | null;
  isStartSignatureEmpty: boolean;
  isEndSignatureEmpty: boolean;
  showValidationAlert: boolean;
  validationType: 'start' | 'end';
}

export function useShiftState() {
  // Core shift states
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [isStartSignatureOpen, setIsStartSignatureOpen] = useState(false);
  const [isEndSignatureOpen, setIsEndSignatureOpen] = useState(false);
  const [isShiftComplete, setIsShiftComplete] = useState(false);
  
  // Manager and signature data
  const [managerName, setManagerName] = useState("");
  const [endManagerName, setEndManagerName] = useState("");
  const [startSignatureData, setStartSignatureData] = useState<string | null>(null);
  const [endSignatureData, setEndSignatureData] = useState<string | null>(null);
  
  // Time tracking states
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [breakStart, setBreakStart] = useState<Date | null>(null);
  const [totalBreakDuration, setTotalBreakDuration] = useState(0); // in seconds
  
  // Form state variables
  const [employerName, setEmployerName] = useState("");
  const [payRate, setPayRate] = useState(15); // Default rate
  const [rateType, setRateType] = useState<RateType>("Per Hour");
  
  // Validation states
  const [isStartSignatureEmpty, setIsStartSignatureEmpty] = useState(true);
  const [isEndSignatureEmpty, setIsEndSignatureEmpty] = useState(true);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationType, setValidationType] = useState<'start' | 'end'>('start');

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
      setTotalBreakDuration(prev => prev + breakDuration);
      setBreakStart(null);
      setIsBreakActive(false);
    }
    
    const currentEndTime = new Date();
    setEndTime(currentEndTime);
    
    // Save to Supabase
    if (startTime && userId) {
      try {
        const { error } = await supabase
          .from('shifts')
          .insert([
            {
              user_id: userId,
              start_time: startTime.toISOString(),
              end_time: currentEndTime.toISOString(),
              break_duration: totalBreakDuration,
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
    // State
    isShiftActive,
    isBreakActive,
    isStartSignatureOpen,
    isEndSignatureOpen,
    isShiftComplete,
    managerName,
    endManagerName,
    startTime,
    endTime,
    breakStart,
    totalBreakDuration,
    employerName,
    payRate,
    rateType,
    startSignatureData,
    endSignatureData,
    isStartSignatureEmpty,
    isEndSignatureEmpty,
    showValidationAlert,
    validationType,
    
    // Setters
    setManagerName,
    setEndManagerName,
    setIsStartSignatureEmpty,
    setIsEndSignatureEmpty,
    setShowValidationAlert,
    setEmployerName,
    setPayRate,
    setRateType,
    setStartSignatureData,
    setEndSignatureData,
    setBreakStart,
    setTotalBreakDuration,
    setIsBreakActive,
    setIsStartSignatureOpen,  // Added this setter
    setIsEndSignatureOpen,    // Added this setter
    
    // Actions
    handleStartShift,
    handleEndShift,
    confirmShiftStart,
    confirmShiftEnd,
  };
}
