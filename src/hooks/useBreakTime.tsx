// src/hooks/useBreakTime.tsx

import { useState, useEffect, useCallback } from "react";
import { differenceInSeconds } from "date-fns";
import { toast } from "sonner";
import {
  saveBreakState,
  loadBreakState,
  clearBreakState
} from "@/services/storageService";

export function useBreakTime() {
  // Load previously saved break data (if any)
  const saved = loadBreakState(); 
  // saved shape: {
  //   isBreakActive: boolean,
  //   selectedBreakDuration: string,
  //   breakStartTime: string | null,
  //   totalBreakDuration: number
  // }

  // State initialization
  const [selectedBreakDuration, setSelectedBreakDuration] = useState<string>(
    saved?.selectedBreakDuration ?? "15"
  );
  const [isBreakActive, setIsBreakActive] = useState<boolean>(
    saved?.isBreakActive ?? false
  );
  const [breakStart, setBreakStart] = useState<Date | null>(
    saved?.breakStartTime ? new Date(saved.breakStartTime) : null
  );
  const [totalBreakDuration, setTotalBreakDuration] = useState<number>(
    saved?.totalBreakDuration ?? 0
  );
  const [remainingBreakTime, setRemainingBreakTime] = useState<number>(() => {
    // If reloading mid-break, compute leftover
    if (saved?.isBreakActive && saved.breakStartTime) {
      const elapsed = differenceInSeconds(
        new Date(),
        new Date(saved.breakStartTime)
      );
      const original = parseInt(
        saved.selectedBreakDuration,
        10
      ) * 60;
      return Math.max(0, original - elapsed);
    }
    // Otherwise show full duration
    return parseInt(saved?.selectedBreakDuration ?? "15", 10) * 60;
  });
  const [breakMenuOpen, setBreakMenuOpen] = useState<boolean>(false);

  // Persist all break state on any change
  useEffect(() => {
    saveBreakState({
      isBreakActive,
      selectedBreakDuration,
      breakStartTime: breakStart?.toISOString() ?? null,
      totalBreakDuration,
    });
  }, [
    isBreakActive,
    selectedBreakDuration,
    breakStart,
    totalBreakDuration,
  ]);

  // Countdown ticker
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBreakActive && remainingBreakTime > 0) {
      timer = setInterval(() => {
        setRemainingBreakTime((prev) => {
          if (prev <= 1) {
            handleBreakEnd(); // Auto-end break when time’s up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreakActive, remainingBreakTime]);

  // Start a break
  const handleBreakStart = useCallback(() => {
    const now = new Date();
    const durationSec = parseInt(selectedBreakDuration, 10) * 60;
    setBreakStart(now);
    setIsBreakActive(true);
    setRemainingBreakTime(durationSec);
    toast.info(`Break started for ${selectedBreakDuration} minutes`);
  }, [selectedBreakDuration]);

  // End a break
  const handleBreakEnd = useCallback(() => {
    if (breakStart) {
      const elapsed = differenceInSeconds(new Date(), breakStart);
      setTotalBreakDuration((prev) => prev + elapsed);
    }
    setIsBreakActive(false);
    setBreakStart(null);
    setRemainingBreakTime(0);
    clearBreakState();
    toast.success("Break ended");
  }, [breakStart]);

  // Toggle start/end from a single handler
  const handleBreakToggle = useCallback(() => {
    isBreakActive ? handleBreakEnd() : handleBreakStart();
  }, [isBreakActive, handleBreakStart, handleBreakEnd]);

  // When user picks a new duration from your menu
  const handleBreakDurationChange = useCallback((duration: string) => {
    setSelectedBreakDuration(duration);
    setRemainingBreakTime(parseInt(duration, 10) * 60);
    setBreakMenuOpen(false);
  }, []);

  // What your UI needs
  return {
    selectedBreakDuration,   // "15", "30", etc.
    remainingBreakTime,      // seconds left
    breakMenuOpen,
    setBreakMenuOpen,
    isBreakActive,
    totalBreakDuration,      // seconds accrued across all breaks
    handleBreakToggle,
    handleBreakDurationChange,
  };
}

