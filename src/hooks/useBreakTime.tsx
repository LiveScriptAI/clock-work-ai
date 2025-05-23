
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
  const [breakIntervals, setBreakIntervals] = useState<{start: Date; end: Date | null}[]>(() => {
    if (saved?.breakIntervals) {
      return saved.breakIntervals.map(interval => ({
        start: new Date(interval.start),
        end: interval.end ? new Date(interval.end) : null
      }));
    }
    return [];
  });
  const [remainingBreakTime, setRemainingBreakTime] = useState<number>(() => {
    if (saved?.isBreakActive && saved.breakIntervals.length > 0) {
      const lastInterval = saved.breakIntervals[saved.breakIntervals.length - 1];
      if (lastInterval.start && !lastInterval.end) {
        const elapsed = differenceInSeconds(
          new Date(),
          new Date(lastInterval.start)
        );
        const original = parseInt(saved.selectedBreakDuration || "15", 10) * 60;
        return original - elapsed;
      }
    }
    return parseInt(saved?.selectedBreakDuration ?? "15", 10) * 60;
  });
  const [breakMenuOpen, setBreakMenuOpen] = useState<boolean>(false);

  // Calculate total break duration from intervals
  const totalBreakDuration = breakIntervals.reduce((total, interval) => {
    if (interval.end) {
      return total + differenceInSeconds(interval.end, interval.start);
    } else if (isBreakActive) {
      // Add current active break time
      return total + differenceInSeconds(new Date(), interval.start);
    }
    return total;
  }, 0);

  // Save break state whenever it changes
  useEffect(() => {
    const intervalsForStorage = breakIntervals.map(interval => ({
      start: interval.start.toISOString(),
      end: interval.end?.toISOString() ?? null
    }));

    saveBreakState({
      isBreakActive,
      selectedBreakDuration,
      breakIntervals: intervalsForStorage,
      totalBreakDuration,
      remainingBreakTime,
      lastUpdatedAt: new Date().toISOString()
    });
  }, [isBreakActive, selectedBreakDuration, breakIntervals, totalBreakDuration, remainingBreakTime]);

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
        
        // Update breakIntervals if they've changed
        const latestIntervals = latestState.breakIntervals.map(interval => ({
          start: new Date(interval.start),
          end: interval.end ? new Date(interval.end) : null
        }));
        
        if (JSON.stringify(latestIntervals) !== JSON.stringify(breakIntervals)) {
          setBreakIntervals(latestIntervals);
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
  }, [isBreakActive, breakIntervals, remainingBreakTime, selectedBreakDuration]);

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
      if (document.visibilityState === 'visible' && isBreakActive && breakIntervals.length > 0) {
        const lastInterval = breakIntervals[breakIntervals.length - 1];
        if (lastInterval && !lastInterval.end) {
          // Recalculate remaining time based on the actual elapsed time
          const elapsed = differenceInSeconds(new Date(), lastInterval.start);
          const original = parseInt(selectedBreakDuration, 10) * 60;
          const newRemaining = original - elapsed;
          setRemainingBreakTime(newRemaining);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isBreakActive, breakIntervals, selectedBreakDuration]);

  const handleBreakStart = useCallback(() => {
    const now = new Date();
    const secs = parseInt(selectedBreakDuration, 10) * 60;
    
    // Add new break interval
    setBreakIntervals(prev => [...prev, { start: now, end: null }]);
    setIsBreakActive(true);
    setRemainingBreakTime(secs);
    toast.info(`Break started for ${selectedBreakDuration} minutes`);
  }, [selectedBreakDuration]);

  const handleBreakEnd = useCallback(() => {
    const now = new Date();
    
    // End the last active break interval
    setBreakIntervals(prev => {
      const updated = [...prev];
      if (updated.length > 0 && !updated[updated.length - 1].end) {
        updated[updated.length - 1].end = now;
      }
      return updated;
    });
    
    setIsBreakActive(false);
    setRemainingBreakTime(0);
    
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

  // Function to completely reset break state
  const resetBreakStateCompletely = useCallback(() => {
    setIsBreakActive(false);
    setBreakIntervals([]);
    setRemainingBreakTime(0);
    resetBreakState();
  }, []);

  return {
    isBreakActive,
    breakIntervals,
    totalBreakDuration,
    remainingBreakTime,
    selectedBreakDuration,
    breakMenuOpen,
    setBreakMenuOpen,
    handleBreakToggle,
    handleBreakDurationChange,
    getCurrentBreakDuration: () => totalBreakDuration,
    resetBreakStateCompletely,
    setTotalBreakDuration: () => {}, // Deprecated, now calculated from intervals
  };
}
