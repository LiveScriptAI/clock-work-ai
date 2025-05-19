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
  // Load any existing break state from localStorage
  const saved = loadBreakState();
  // saved shape: {
  //   isBreakActive: boolean;
  //   selectedBreakDuration: string;
  //   breakStartTime: string | null;
  //   totalBreakDuration: number;
  // }

  // Initialize state, restoring from saved if present
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
    if (saved?.isBreakActive && saved.breakStartTime) {
      const elapsed = differenceInSeconds(
        new Date(),
        new Date(saved.breakStartTime)
      );
      const original = parseInt(saved.selectedBreakDuration, 10) * 60;
      return Math.max(0, original - elapsed);
    }
    return parseInt(saved?.selectedBreakDuration ?? "15", 10) * 60;
  });
  const [breakMenuOpen, setBreakMenuOpen] = useState<boolean>(false);

  // Persist state on any change
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
    if (!isBreakActive || remainingBreakTime <= 0) return;
    const id = setInterval(() => {
      setRemainingBreakTime(prev => {
        if (prev <= 1) {
          handleBreakEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isBreakActive, remainingBreakTime]);

  // Start break
  const handleBreakStart = useCallback(() => {
    const now = new Date();
    const durationSec = parseInt(selectedBreakDuration, 10) * 60;
    setBreakStart(now);
    setIsBreakActive(true);
    setRemainingBreakTime(durationSec);
    toast.info(`Break started for ${selectedBreakDuration} minutes`);
  }, [selectedBreakDuration]);

  // End break
  const handleBreakEnd = useCallback(() => {
    if (breakStart) {
      const elapsed = differenceInSeconds(new Date(), breakStart);
      setTotalBreakDuration(prev => prev + elapsed);
    }
    setIsBreakActive(false);
    setBreakStart(null);
    setRemainingBreakTime(0);
    clearBreakState();
    toast.success("Break ended");
  }, [breakStart]);

  // Toggle break
  const handleBreakToggle = useCallback(() => {
    isBreakActive ? handleBreakEnd() : handleBreakStart();
  }, [isBreakActive, handleBreakEnd, handleBreakStart]);

  // Change duration
  const handleBreakDurationChange = useCallback((duration: string) => {
    setSelectedBreakDuration(duration);
    setRemainingBreakTime(parseInt(duration, 10) * 60);
    setBreakMenuOpen(false);
  }, []);

  return {
    // Data
    isBreakActive,
    breakStart,
    totalBreakDuration,
    remainingBreakTime,
    selectedBreakDuration,
    breakMenuOpen,
    // Actions
    setBreakMenuOpen,
    handleBreakToggle,
    handleBreakDurationChange,
  };
}

