
import { useState, useEffect, useCallback, useRef } from "react";
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
  const syncIntervalRef = useRef<number | null>(null);

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
      // We now allow negative remaining time (meaning break has exceeded duration)
      return original - elapsed;
    }
    return parseInt(saved?.selectedBreakDuration ?? "15", 10) * 60;
  });
  const [breakMenuOpen, setBreakMenuOpen] = useState<boolean>(false);

  // Save break state whenever it changes
  useEffect(() => {
    saveBreakState({
      isBreakActive,
      selectedBreakDuration,
      breakStartTime: breakStart?.toISOString() ?? null,
      totalBreakDuration,
      remainingBreakTime,
      lastUpdatedAt: new Date().toISOString()
    });
  }, [isBreakActive, selectedBreakDuration, breakStart, totalBreakDuration, remainingBreakTime]);

  // Check for break state changes from other tabs/devices
  useEffect(() => {
    const checkForExternalChanges = () => {
      const latestState = loadBreakState();
      if (!latestState) return;

      // Only update if the data has changed from another source
      if (latestState.lastUpdatedAt && 
          new Date(latestState.lastUpdatedAt).getTime() > new Date().getTime() - 2000) {
        
        // Update all states if they've changed
        if (latestState.isBreakActive !== isBreakActive) {
          setIsBreakActive(latestState.isBreakActive);
        }
        
        if (latestState.breakStartTime !== breakStart?.toISOString()) {
          setBreakStart(latestState.breakStartTime ? new Date(latestState.breakStartTime) : null);
        }
        
        if (latestState.totalBreakDuration !== totalBreakDuration) {
          setTotalBreakDuration(latestState.totalBreakDuration);
        }
        
        if (latestState.selectedBreakDuration !== selectedBreakDuration) {
          setSelectedBreakDuration(latestState.selectedBreakDuration);
        }
        
        if (latestState.remainingBreakTime !== remainingBreakTime) {
          setRemainingBreakTime(latestState.remainingBreakTime);
        }
      }
    };

    // Check for external changes every 2 seconds
    syncIntervalRef.current = window.setInterval(checkForExternalChanges, 2000);

    return () => {
      if (syncIntervalRef.current !== null) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isBreakActive, breakStart, totalBreakDuration, remainingBreakTime, selectedBreakDuration]);

  // Countdown timer for active breaks
  useEffect(() => {
    if (!isBreakActive) return;
    
    const id = setInterval(() => {
      setRemainingBreakTime(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(id);
  }, [isBreakActive]);

  // Handle visibility change (when tab becomes active again)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isBreakActive && breakStart) {
        // Recalculate remaining time based on the actual elapsed time
        const elapsed = differenceInSeconds(new Date(), breakStart);
        const original = parseInt(selectedBreakDuration, 10) * 60;
        const newRemaining = original - elapsed;
        setRemainingBreakTime(newRemaining);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isBreakActive, breakStart, selectedBreakDuration]);

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
    
    // Don't clear break state completely, just update it
    saveBreakState({
      isBreakActive: false,
      selectedBreakDuration,
      breakStartTime: null,
      totalBreakDuration: breakStart ? 
        totalBreakDuration + differenceInSeconds(new Date(), breakStart) : 
        totalBreakDuration,
      remainingBreakTime: 0,
      lastUpdatedAt: new Date().toISOString()
    });
    
    toast.success("Break ended");
  }, [breakStart, totalBreakDuration, selectedBreakDuration]);

  const handleBreakToggle = useCallback(() => {
    isBreakActive ? handleBreakEnd() : handleBreakStart();
  }, [isBreakActive, handleBreakEnd, handleBreakStart]);

  const handleBreakDurationChange = useCallback((duration: string) => {
    setSelectedBreakDuration(duration);
    setRemainingBreakTime(parseInt(duration, 10) * 60);
    setBreakMenuOpen(false);
  }, []);

  // Getter function for current break duration (including active break)
  const getCurrentBreakDuration = useCallback(() => {
    let totalBreak = totalBreakDuration;
    
    // Add current break if active
    if (isBreakActive && breakStart) {
      totalBreak += differenceInSeconds(new Date(), breakStart);
    }
    
    return totalBreak;
  }, [isBreakActive, breakStart, totalBreakDuration]);

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
    getCurrentBreakDuration,
  };
}
