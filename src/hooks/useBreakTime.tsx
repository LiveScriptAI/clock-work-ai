
import { useState, useEffect, useCallback, useRef } from "react";
import { differenceInSeconds } from "date-fns";
import { toast } from "sonner";
import {
  saveBreakState,
  loadBreakState,
  clearBreakState,
  resetBreakState,
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
  const [breakIntervals, setBreakIntervals] = useState<{ start: string; end: string | null }[]>(
    saved?.breakIntervals ?? []
  );
  const [remainingBreakTime, setRemainingBreakTime] = useState<number>(() => {
    if (saved?.isBreakActive && saved.breakStartTime) {
      const elapsed = differenceInSeconds(
        new Date(),
        new Date(saved.breakStartTime)
      );
      const original = parseInt(saved.selectedBreakDuration || "15", 10) * 60;
      return original - elapsed;
    }
    return parseInt(saved?.selectedBreakDuration ?? "15", 10) * 60;
  });
  const [breakMenuOpen, setBreakMenuOpen] = useState<boolean>(false);

  // Calculate total break duration from intervals
  const getTotalBreakSeconds = useCallback((): number => {
    let total = 0;
    
    for (const interval of breakIntervals) {
      const start = new Date(interval.start);
      const end = interval.end ? new Date(interval.end) : null;
      
      if (end) {
        // Completed interval
        total += differenceInSeconds(end, start);
      } else if (isBreakActive && breakStart) {
        // Current active break
        total += differenceInSeconds(new Date(), start);
      }
    }
    
    return total;
  }, [breakIntervals, isBreakActive, breakStart]);

  // Get break intervals as Date objects
  const getBreakIntervals = useCallback((): { start: Date; end: Date }[] => {
    return breakIntervals
      .filter(interval => interval.end !== null)
      .map(interval => ({
        start: new Date(interval.start),
        end: new Date(interval.end!)
      }));
  }, [breakIntervals]);

  // Save break state whenever it changes
  useEffect(() => {
    saveBreakState({
      isBreakActive,
      selectedBreakDuration,
      breakStartTime: breakStart?.toISOString() ?? null,
      breakIntervals,
      lastUpdatedAt: new Date().toISOString()
    });
  }, [isBreakActive, selectedBreakDuration, breakStart, breakIntervals]);

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
        
        if (JSON.stringify(latestState.breakIntervals) !== JSON.stringify(breakIntervals)) {
          setBreakIntervals(latestState.breakIntervals);
        }
        
        if (latestState.selectedBreakDuration !== selectedBreakDuration) {
          setSelectedBreakDuration(latestState.selectedBreakDuration);
        }
        
        if (latestState.breakStartTime && isBreakActive) {
          const elapsed = differenceInSeconds(
            new Date(),
            new Date(latestState.breakStartTime)
          );
          const original = parseInt(latestState.selectedBreakDuration, 10) * 60;
          setRemainingBreakTime(original - elapsed);
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
  }, [isBreakActive, breakStart, breakIntervals, remainingBreakTime, selectedBreakDuration]);

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
    
    // Append new break interval
    setBreakIntervals(prev => [...prev, { start: now.toISOString(), end: null }]);
    
    toast.info(`Break started for ${selectedBreakDuration} minutes`);
  }, [selectedBreakDuration]);

  const handleBreakEnd = useCallback(() => {
    const now = new Date();
    setIsBreakActive(false);
    setBreakStart(null);
    setRemainingBreakTime(0);
    
    // Set end time on the last interval
    setBreakIntervals(prev => {
      const updated = [...prev];
      if (updated.length > 0 && updated[updated.length - 1].end === null) {
        updated[updated.length - 1].end = now.toISOString();
      }
      return updated;
    });
    
    toast.success("Break ended");
  }, []);

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
    return getTotalBreakSeconds();
  }, [getTotalBreakSeconds]);

  // Function to completely reset break state
  const resetBreakStateCompletely = useCallback(() => {
    setIsBreakActive(false);
    setBreakStart(null);
    setBreakIntervals([]);
    setRemainingBreakTime(0);
    resetBreakState();
  }, []);

  return {
    isBreakActive,
    breakStart,
    totalBreakDuration: getTotalBreakSeconds(),
    remainingBreakTime,
    selectedBreakDuration,
    breakMenuOpen,
    setBreakMenuOpen,
    handleBreakToggle,
    handleBreakDurationChange,
    getCurrentBreakDuration,
    resetBreakStateCompletely,
    setTotalBreakDuration: () => {}, // Keep for compatibility but no longer used
    getBreakIntervals,
    getTotalBreakSeconds,
  };
}
