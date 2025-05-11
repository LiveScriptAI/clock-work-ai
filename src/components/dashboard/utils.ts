
import { differenceInSeconds, differenceInMinutes, differenceInHours } from "date-fns";

// Format duration for display (hours and minutes)
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return `${hours}h ${minutes}m`;
};

// Format countdown time (minutes and seconds)
export const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Calculate time worked in seconds
export const calculateTimeWorked = (
  startTime: Date | null,
  endTime: Date | null,
  totalBreakDuration: number
): number => {
  if (!startTime) return 0;
  
  const end = endTime || new Date();
  const totalSeconds = differenceInSeconds(end, startTime);
  
  // Subtract break time
  return Math.max(0, totalSeconds - totalBreakDuration);
};

// Calculate earnings based on time worked
export const calculateEarnings = (
  calculateTimeWorked: () => number,
  hourlyRate: number
): string => {
  const seconds = calculateTimeWorked();
  const hours = seconds / 3600;
  return (hours * hourlyRate).toFixed(2);
};

// Format break duration for display
export const getBreakDuration = (
  totalBreakDuration: number,
  isBreakActive: boolean,
  breakStart: Date | null
): string => {
  let totalBreak = totalBreakDuration;
  
  // Add current break if active
  if (isBreakActive && breakStart) {
    totalBreak += differenceInSeconds(new Date(), breakStart);
  }
  
  const minutes = Math.floor(totalBreak / 60);
  return `${minutes} minutes`;
};
