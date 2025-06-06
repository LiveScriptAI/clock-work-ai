
import { useState, useEffect, useRef } from 'react';

export interface BreakInterval {
  start: Date;
  end: Date | null;
}

export function usePreviewTimeTracking() {
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [breakStart, setBreakStart] = useState<Date | null>(null);
  const [breakIntervals, setBreakIntervals] = useState<BreakInterval[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const intervalRef = useRef<number>();

  // Update current time every second when shift is active
  useEffect(() => {
    if (isShiftActive) {
      intervalRef.current = window.setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isShiftActive]);

  const handleStartShift = () => {
    const now = new Date();
    setStartTime(now);
    setIsShiftActive(true);
    setBreakIntervals([]);
  };

  const handleEndShift = () => {
    // End any active break
    if (isBreakActive && breakStart) {
      setBreakIntervals(prev => [
        ...prev.slice(0, -1),
        { start: breakStart, end: new Date() }
      ]);
      setIsBreakActive(false);
      setBreakStart(null);
    }
    
    setIsShiftActive(false);
    // Don't reset startTime immediately so we can show the final duration
  };

  const handleBreakToggle = () => {
    const now = new Date();
    
    if (isBreakActive) {
      // End break
      if (breakStart) {
        setBreakIntervals(prev => [
          ...prev.slice(0, -1),
          { start: breakStart, end: now }
        ]);
      }
      setIsBreakActive(false);
      setBreakStart(null);
    } else {
      // Start break
      setIsBreakActive(true);
      setBreakStart(now);
      setBreakIntervals(prev => [...prev, { start: now, end: null }]);
    }
  };

  const resetPreview = () => {
    setIsShiftActive(false);
    setIsBreakActive(false);
    setStartTime(null);
    setBreakStart(null);
    setBreakIntervals([]);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Calculate total worked time (excluding breaks)
  const getWorkedDuration = () => {
    if (!startTime) return 0;
    
    const endTime = isShiftActive ? currentTime : startTime;
    const totalSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    // Calculate total break time
    let totalBreakSeconds = 0;
    breakIntervals.forEach(interval => {
      if (interval.end) {
        totalBreakSeconds += Math.floor((interval.end.getTime() - interval.start.getTime()) / 1000);
      }
    });
    
    // Add current break if active
    if (isBreakActive && breakStart) {
      totalBreakSeconds += Math.floor((currentTime.getTime() - breakStart.getTime()) / 1000);
    }
    
    return Math.max(0, totalSeconds - totalBreakSeconds);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isShiftActive,
    isBreakActive,
    startTime,
    breakIntervals,
    currentTime,
    workedDuration: getWorkedDuration(),
    handleStartShift,
    handleEndShift,
    handleBreakToggle,
    resetPreview,
    formatDuration
  };
}
