
import { useState, useEffect, useCallback } from "react";
import { differenceInSeconds } from "date-fns";
import { toast } from "sonner";
import {
  saveBreakState,
  loadBreakState,
  clearBreakState,
  StoredBreakState
} from "@/services/storageService";

export function useBreakTime() {
  const saved = loadBreakState();

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
      const original = parseInt(saved.selectedBreakDuration || "15", 10) * 60;
      return Math.max(0, original - elapsed);
    }
    return parseInt(saved?.selectedBreakDuration ?? "15", 10) * 60;
  });
  const [breakMenuOpen, setBreakMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    saveBreakState({
      isBreakActive,
      selectedBreakDuration,
      breakStartTime: breakStart?.toISOString() ?? null,
      totalBreakDuration,
      remainingBreakTime
    });
  }, [isBreakActive, selectedBreakDuration, breakStart, totalBreakDuration]);

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

  const handleBreakStart = useCallback(() => {
    const now = new Date();
    const secs = parseInt(selectedBreakDuration, 10) * 60;
    setBreakStart(now);
    setIsBreakActive(true);
    setRemainingBreakTime(secs);
    toast.info(`Break started for ${selectedBreakDuration} minutes`);
  }, [selectedBreakDuration]);

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

  const handleBreakToggle = useCallback(() => {
    isBreakActive ? handleBreakEnd() : handleBreakStart();
  }, [isBreakActive, handleBreakEnd, handleBreakStart]);

  const handleBreakDurationChange = useCallback((duration: string) => {
    setSelectedBreakDuration(duration);
    setRemainingBreakTime(parseInt(duration, 10) * 60);
    setBreakMenuOpen(false);
  }, []);

  return {
    isBreakActive,
    breakStart,
    totalBreakDuration,
    remainingBreakTime,
    selectedBreakDuration,
    breakMenuOpen,
    setBreakMenuOpen,
    handleBreakToggle,
    handleBreakDurationChange,
  };
}
