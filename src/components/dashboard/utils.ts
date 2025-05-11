
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

// Calculate earnings based on time worked and rate type
export const calculateEarnings = (
  calculateTimeWorked: () => number,
  payRate: number = 15,
  rateType: string = "Per Hour"
): string => {
  const seconds = calculateTimeWorked();
  const hours = seconds / 3600;
  
  // Default to hourly rate if no rate is provided
  const rate = payRate || 15;

  // Convert different rate types to hourly equivalent for calculation
  let earnings = 0;
  switch (rateType) {
    case "Per Day":
      // Assuming 8-hour workday
      earnings = hours * (rate / 8);
      break;
    case "Per Week":
      // Assuming 40-hour workweek
      earnings = hours * (rate / 40);
      break;
    case "Per Month":
      // Assuming 160-hour work month (40 hours × 4 weeks)
      earnings = hours * (rate / 160);
      break;
    case "Per Hour":
    default:
      earnings = hours * rate;
      break;
  }
  
  return earnings.toFixed(2);
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
