
import { useState, useEffect } from "react";
import { differenceInSeconds } from "date-fns";
import { toast } from "sonner";
import { saveBreakState, loadBreakState, clearBreakState } from "@/services/storageService";

export function useBreakTime(
  isBreakActive: boolean, 
  setIsBreakActive: (active: boolean) => void,
  breakStart: Date | null,
  setBreakStart: (date: Date | null) => void,
  totalBreakDuration: number,
  setTotalBreakDuration: (duration: number) => void
) {
  // Break time states
  const [selectedBreakDuration, setSelectedBreakDuration] = useState("15"); // Default 15 minutes
  const [remainingBreakTime, setRemainingBreakTime] = useState(0); // in seconds
  const [breakMenuOpen, setBreakMenuOpen] = useState(false);

  // Load saved break state on component mount
  useEffect(() => {
    const savedBreakState = loadBreakState();
    
    if (savedBreakState) {
      setSelectedBreakDuration(savedBreakState.selectedBreakDuration);
      
      if (savedBreakState.breakStartTime && isBreakActive) {
        const now = new Date();
        const savedBreakStart = new Date(savedBreakState.breakStartTime);
        const elapsedTime = differenceInSeconds(now, savedBreakStart);
        const originalDuration = parseInt(savedBreakState.selectedBreakDuration, 10) * 60;
        
        // Calculate correct remaining time
        const newRemainingTime = Math.max(0, originalDuration - elapsedTime);
        setRemainingBreakTime(newRemainingTime);
      }
    }
  }, [isBreakActive]);

  // Break countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isBreakActive && breakStart && remainingBreakTime > 0) {
      interval = setInterval(() => {
        setRemainingBreakTime((prev: number) => {
          if (prev <= 1) {
            // Break time is up
            handleBreakEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Save break state whenever these values change
      saveBreakState({
        selectedBreakDuration,
        breakStartTime: breakStart ? breakStart.toISOString() : null,
        remainingBreakTime
      });
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreakActive, breakStart, remainingBreakTime, selectedBreakDuration]);

  const handleBreakStart = () => {
    const durationInMinutes = parseInt(selectedBreakDuration, 10);
    const durationInSeconds = durationInMinutes * 60;
    
    const now = new Date();
    setBreakStart(now);
    setIsBreakActive(true);
    setRemainingBreakTime(durationInSeconds);
    
    toast.info(`Break started for ${durationInMinutes} minutes`);
    
    // Save initial break state
    saveBreakState({
      selectedBreakDuration,
      breakStartTime: now.toISOString(),
      remainingBreakTime: durationInSeconds
    });
  };

  const handleBreakEnd = () => {
    if (breakStart) {
      const breakDuration = differenceInSeconds(new Date(), breakStart);
      // Calculate the new total first, then set it directly
      const newTotalBreakDuration = totalBreakDuration + breakDuration;
      setTotalBreakDuration(newTotalBreakDuration);
    }
    
    setBreakStart(null);
    setIsBreakActive(false);
    setRemainingBreakTime(0);
    
    // Clear break state from storage
    clearBreakState();
    
    toast.success("Break ended");
  };

  const handleBreakToggle = () => {
    if (isBreakActive) {
      handleBreakEnd();
    } else {
      handleBreakStart();
    }
  };

  const handleBreakDurationChange = (duration: string) => {
    setSelectedBreakDuration(duration);
    setBreakMenuOpen(false);
  };

  return {
    selectedBreakDuration,
    remainingBreakTime,
    breakMenuOpen,
    setBreakMenuOpen,
    handleBreakToggle,
    handleBreakDurationChange
  };
}
