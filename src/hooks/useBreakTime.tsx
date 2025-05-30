
import { useState, useEffect, useCallback, useRef } from "react";
import { differenceInSeconds, format } from "date-fns";
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
  const [breakStart, setBreakStart] = useState<Date | null>(() => {
    if (saved?.breakStart) {
      return new Date(saved.breakStart);
    }
    return null;
  });
  const [breakEnd, setBreakEnd] = useState<Date | null>(() => {
    if (saved?.breakEnd) {
      return new Date(saved.breakEnd);
    }
    return null;
  });
  const [breakIntervals, setBreakIntervals] = useState<{start: Date; end: Date | null}[]>(() => {
    if (saved?.breakIntervals) {
      return saved.breakIntervals.map(interval => ({
        start: new Date(interval.start),
        end: interval.end ? new Date(interval.end) : null
      }));
    }
    return [];
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

  // Save break state whenever it changes (but don't save to break intervals service automatically)
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
      remainingBreakTime: 0, // No longer using countdown
      breakStart: breakStart?.toISOString() ?? null,
      breakEnd: breakEnd?.toISOString() ?? null,
      lastUpdatedAt: new Date().toISOString()
    });

    console.log("useBreakTime - Break state updated in localStorage");
  }, [isBreakActive, selectedBreakDuration, breakIntervals, totalBreakDuration, breakStart, breakEnd]);

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

        // Update breakStart and breakEnd
        const newBreakStart = latestState.breakStart ? new Date(latestState.breakStart) : null;
        const newBreakEnd = latestState.breakEnd ? new Date(latestState.breakEnd) : null;
        
        if (JSON.stringify(newBreakStart) !== JSON.stringify(breakStart)) {
          setBreakStart(newBreakStart);
        }
        
        if (JSON.stringify(newBreakEnd) !== JSON.stringify(breakEnd)) {
          setBreakEnd(newBreakEnd);
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
  }, [isBreakActive, breakIntervals, selectedBreakDuration, breakStart, breakEnd]);

  const handleBreakStart = useCallback(() => {
    const now = new Date();
    
    // Set breakStart and clear breakEnd
    setBreakStart(now);
    setBreakEnd(null);
    
    // Add new break interval
    setBreakIntervals(prev => [...prev, { start: now, end: null }]);
    setIsBreakActive(true);
    
    toast.info(`Break started at ${format(now, 'HH:mm:ss')}`);
  }, []);

  const handleBreakEnd = useCallback(() => {
    const now = new Date();
    
    // Set breakEnd
    setBreakEnd(now);
    
    // End the last active break interval
    setBreakIntervals(prev => {
      const updated = [...prev];
      if (updated.length > 0 && !updated[updated.length - 1].end) {
        updated[updated.length - 1].end = now;
      }
      return updated;
    });
    
    setIsBreakActive(false);
    
    toast.success(`Break ended at ${format(now, 'HH:mm:ss')}`);
  }, []);

  const handleBreakToggle = useCallback(() => {
    isBreakActive ? handleBreakEnd() : handleBreakStart();
  }, [isBreakActive, handleBreakEnd, handleBreakStart]);

  const handleBreakDurationChange = useCallback((duration: string) => {
    setSelectedBreakDuration(duration);
    setBreakMenuOpen(false);
  }, []);

  // Function to completely reset break state
  const resetBreakStateCompletely = useCallback(() => {
    setIsBreakActive(false);
    setBreakIntervals([]);
    setBreakStart(null);
    setBreakEnd(null);
    resetBreakState();
  }, []);

  return {
    isBreakActive,
    breakStart,
    breakEnd,
    breakIntervals,
    totalBreakDuration,
    selectedBreakDuration,
    breakMenuOpen,
    setBreakMenuOpen,
    handleBreakToggle,
    handleBreakDurationChange,
    getCurrentBreakDuration: () => totalBreakDuration,
    resetBreakStateCompletely,
  };
}
