
import { useState, useEffect } from "react";
import { differenceInSeconds } from "date-fns";
import { toast } from "sonner";

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

  // Break countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isBreakActive && breakStart && remainingBreakTime > 0) {
      interval = setInterval(() => {
        setRemainingBreakTime((prev) => {
          // Fix: Convert the return value to a number explicitly
          if (prev <= 1) {
            // Break time is up
            handleBreakEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreakActive, breakStart, remainingBreakTime]);

  const handleBreakStart = () => {
    const durationInMinutes = parseInt(selectedBreakDuration, 10);
    const durationInSeconds = durationInMinutes * 60;
    
    setBreakStart(new Date());
    setIsBreakActive(true);
    setRemainingBreakTime(durationInSeconds);
    
    toast.info(`Break started for ${durationInMinutes} minutes`);
  };

  const handleBreakEnd = () => {
    if (breakStart) {
      const breakDuration = differenceInSeconds(new Date(), breakStart);
      setTotalBreakDuration(prev => prev + breakDuration);
    }
    
    setBreakStart(null);
    setIsBreakActive(false);
    setRemainingBreakTime(0);
    
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
