
import { differenceInSeconds, differenceInMinutes, differenceInHours } from "date-fns";
import { calculateEarningsFromSeconds } from "@/utils/earningsCalculator";

// Format duration for display (hours and minutes)
export const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return "0h 0m";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return `${hours}h ${minutes}m`;
};

// Format hours and minutes from decimal hours
export const formatHoursAndMinutes = (hours: number): string => {
  if (isNaN(hours) || hours < 0) return "0h 0m";
  
  const wholeHours = Math.floor(hours);
  const minutes = Math.floor((hours - wholeHours) * 60);
  
  return `${wholeHours}h ${minutes}m`;
};

// Format countdown time (minutes and seconds)
export const formatCountdown = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) seconds = Math.abs(seconds);
  
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

// Calculate earnings based on time worked and rate type - using unified calculator
export const calculateEarnings = (
  timeWorkedInSeconds: number,
  payRate: number = 15,
  rateType: string = "Per Hour"
): string => {
  if (isNaN(timeWorkedInSeconds) || timeWorkedInSeconds < 0) return "0.00";
  
  // Convert different rate types to hourly equivalent for calculation
  let hourlyRate = payRate;
  switch (rateType) {
    case "Per Day":
      // Assuming 8-hour workday
      hourlyRate = payRate / 8;
      break;
    case "Per Week":
      // Assuming 40-hour workweek
      hourlyRate = payRate / 40;
      break;
    case "Per Month":
      // Assuming 160-hour work month (40 hours × 4 weeks)
      hourlyRate = payRate / 160;
      break;
    case "Per Hour":
    default:
      hourlyRate = payRate;
      break;
  }
  
  // Use the unified earnings calculator
  const earnings = calculateEarningsFromSeconds(timeWorkedInSeconds, hourlyRate);
  return earnings.toFixed(2);
};

// Format break duration for display
export const getBreakDuration = (
  totalBreakDuration: number,
  isBreakActive: boolean,
  breakStart: Date | null
): string => {
  // Base break time in seconds
  let totalBreak = totalBreakDuration;
  
  // Add current break if active
  if (isBreakActive && breakStart) {
    const currentBreakSeconds = differenceInSeconds(new Date(), breakStart);
    totalBreak += currentBreakSeconds;
  }
  
  // Always show at least 1 minute if there was any break time at all
  const minutes = totalBreak > 0 ? Math.max(1, Math.ceil(totalBreak / 60)) : 0;
  
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
};
