
// src/hooks/useBreakTime.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { differenceInSeconds, format } from "date-fns";
import { toast } from "sonner";

import {
  saveBreakState,
  loadBreakState,
  clearBreakState,
  resetBreakState,
  StoredBreakState,
} from "@/services/storageService";

export function useBreakTime() {
  const saved = loadBreakState();
  const syncIntervalRef = useRef<number | null>(null);

  // State
  const [isBreakActive, setIsBreakActive] = useState<boolean>(saved?.isBreakActive ?? false);
  const [breakStart,   setBreakStart]   = useState<Date | null>(
    saved?.breakStart ? new Date(saved.breakStart) : null
  );
  const [breakEnd,     setBreakEnd]     = useState<Date | null>(
    saved?.breakEnd ? new Date(saved.breakEnd) : null
  );
  const [breakIntervals, setBreakIntervals] = useState<{ start: Date; end: Date | null }[]>(
    () => (saved?.breakIntervals ?? []).map(i => ({
      start: new Date(i.start),
      end:   i.end ? new Date(i.end) : null
    }))
  );
  const [selectedBreakDuration, setSelectedBreakDuration] = useState<string>(
    saved?.selectedBreakDuration ?? "15"
  );
  const [breakMenuOpen, setBreakMenuOpen] = useState<boolean>(false);

  // Total break secs (past + current)
  const totalBreakDuration = breakIntervals.reduce((sum, iv) => {
    if (iv.end) return sum + differenceInSeconds(iv.end, iv.start);
    if (isBreakActive) return sum + differenceInSeconds(new Date(), iv.start);
    return sum;
  }, 0);

  // Persist on every change
  useEffect(() => {
    const intervalsForStorage = breakIntervals.map(iv => ({
      start: iv.start.toISOString(),
      end:   iv.end?.toISOString() ?? null
    }));
    const state: StoredBreakState = {
      isBreakActive,
      selectedBreakDuration,
      breakStart:       breakStart?.toISOString() ?? null,
      breakEnd:         breakEnd?.toISOString() ?? null,
      breakIntervals:   intervalsForStorage,
      totalBreakDuration,
      remainingBreakTime: 0,
      lastUpdatedAt:      new Date().toISOString(),
    };
    saveBreakState(state);
  }, [isBreakActive, breakStart, breakEnd, breakIntervals, selectedBreakDuration, totalBreakDuration]);

  // Sync across tabs
  useEffect(() => {
    const checkExternal = () => {
      const latest = loadBreakState();
      if (!latest) return;

      if (new Date(latest.lastUpdatedAt).getTime() > Date.now() - 2000) {
        setIsBreakActive(latest.isBreakActive);
        setBreakStart( latest.breakStart ? new Date(latest.breakStart) : null );
        setBreakEnd(   latest.breakEnd   ? new Date(latest.breakEnd)   : null );
        setSelectedBreakDuration(latest.selectedBreakDuration);
        setBreakIntervals(
          (latest.breakIntervals ?? []).map(i => ({
            start: new Date(i.start),
            end:   i.end ? new Date(i.end) : null
          }))
        );
      }
    };

    syncIntervalRef.current = window.setInterval(checkExternal, 2000);
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  // Start a break
  const handleBreakStart = useCallback(() => {
    const now = new Date();
    setBreakStart(now);
    setBreakEnd(null);
    setBreakIntervals(prev => [...prev, { start: now, end: null }]);
    setIsBreakActive(true);
    toast.info(`Break started at ${format(now, "HH:mm:ss")}`);
  }, []);

  // End current break
  const handleBreakEnd = useCallback(() => {
    const now = new Date();
    setBreakEnd(now);
    setBreakIntervals(prev => {
      const copy = [...prev];
      if (copy.length && !copy[copy.length - 1].end) {
        copy[copy.length - 1].end = now;
      }
      return copy;
    });
    setIsBreakActive(false);
    toast.success(`Break ended at ${format(now, "HH:mm:ss")}`);
  }, []);

  // Toggle start/end
  const handleBreakToggle = useCallback(() => {
    isBreakActive ? handleBreakEnd() : handleBreakStart();
  }, [isBreakActive, handleBreakEnd, handleBreakStart]);

  // Duration selection (unused if tracking intervals)
  const handleBreakDurationChange = useCallback((dur: string) => {
    setSelectedBreakDuration(dur);
    setBreakMenuOpen(false);
  }, []);

  // Completely reset
  const resetBreakStateCompletely = useCallback(() => {
    setIsBreakActive(false);
    setBreakStart(null);
    setBreakEnd(null);
    setBreakIntervals([]);
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
