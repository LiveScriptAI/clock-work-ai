
import { differenceInSeconds } from 'date-fns';

export interface EarningsResult {
  hoursWorked: number;
  earnings: number;
}

/**
 * Calculate earnings with consistent precision across the entire app
 * @param startTime - Shift start time
 * @param endTime - Shift end time
 * @param breakSeconds - Total break time in seconds
 * @param payRate - Hourly pay rate
 * @returns Object with hoursWorked and earnings (rounded to 2 decimal places)
 */
export const calculateEarnings = (
  startTime: Date,
  endTime: Date,
  breakSeconds: number,
  payRate: number
): EarningsResult => {
  // Calculate total seconds worked (minus breaks)
  const totalSeconds = differenceInSeconds(endTime, startTime);
  const secondsWorked = Math.max(0, totalSeconds - breakSeconds);
  
  // Convert to hours with full precision
  const hoursWorked = secondsWorked / 3600;
  
  // Calculate raw earnings with full precision
  const rawEarnings = hoursWorked * payRate;
  
  // Round only at the end to prevent cumulative rounding errors
  const roundedEarnings = parseFloat(rawEarnings.toFixed(2));
  
  return {
    hoursWorked: parseFloat(hoursWorked.toFixed(4)), // Keep some precision for hours
    earnings: roundedEarnings
  };
};

/**
 * Calculate earnings from seconds worked (for cases where start/end times aren't available)
 * @param secondsWorked - Total seconds worked
 * @param payRate - Hourly pay rate
 * @returns Earnings rounded to 2 decimal places
 */
export const calculateEarningsFromSeconds = (
  secondsWorked: number,
  payRate: number
): number => {
  const hoursWorked = secondsWorked / 3600;
  const rawEarnings = hoursWorked * payRate;
  return parseFloat(rawEarnings.toFixed(2));
};

/**
 * Format hours for display (e.g., "4.25h" or "4h 15m")
 * @param hours - Hours as decimal
 * @param format - 'decimal' or 'hoursMinutes'
 * @returns Formatted string
 */
export const formatHours = (hours: number, format: 'decimal' | 'hoursMinutes' = 'hoursMinutes'): string => {
  if (format === 'decimal') {
    return `${hours.toFixed(2)}h`;
  }
  
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  
  return `${wholeHours}h ${minutes}m`;
};

/**
 * Format earnings for display with currency symbol
 * @param earnings - Earnings amount
 * @param currency - Currency symbol (default: '£')
 * @returns Formatted string
 */
export const formatEarnings = (earnings: number, currency: string = '£'): string => {
  return `${currency}${earnings.toFixed(2)}`;
};
