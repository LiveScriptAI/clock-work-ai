
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ShiftEntry } from "./types";
import { getBreakIntervalsForShift } from "@/services/breakDataService";

// Filter timesheet entries based on selected time period
export const filterShiftsByPeriod = (shifts: ShiftEntry[], period: string) => {
  const now = new Date();
  
  switch (period) {
    case "day":
      return shifts.filter(shift => 
        shift.date.getDate() === now.getDate() &&
        shift.date.getMonth() === now.getMonth() &&
        shift.date.getFullYear() === now.getFullYear()
      );
    case "week":
      // Simple approximation - get shifts from the past 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return shifts.filter(shift => shift.date >= oneWeekAgo);
    case "month":
      // Get shifts from the current month
      return shifts.filter(shift => 
        shift.date.getMonth() === now.getMonth() &&
        shift.date.getFullYear() === now.getFullYear()
      );
    default:
      return shifts;
  }
};

// Filter shifts by date range
export const filterShiftsByDateRange = (
  shifts: ShiftEntry[],
  fromDate: Date | undefined,
  toDate: Date | undefined
) => {
  if (!fromDate || !toDate) return shifts;

  return shifts.filter((shift) => {
    const shiftDate = startOfDay(shift.date);
    return isWithinInterval(shiftDate, {
      start: startOfDay(fromDate),
      end: endOfDay(toDate),
    });
  });
};

// Convert Supabase shift data to ShiftEntry format
export const convertSupabaseShiftToShiftEntry = async (shiftData: any): Promise<ShiftEntry> => {
  const startTime = new Date(shiftData.start_time);
  const endTime = new Date(shiftData.end_time);
  
  // Ensure break_duration is a valid number (defaults to 0 if invalid)
  const breakDurationSeconds = typeof shiftData.break_duration === 'number' ? 
    Math.max(0, shiftData.break_duration) : 0;
    
  // Convert to minutes for display
  const breakMinutes = breakDurationSeconds > 0 ? 
    Math.max(1, Math.ceil(breakDurationSeconds / 60)) : 0;

  // Calculate hours worked (in hours) - accounting for break time
  const totalSeconds = Math.max(0, (endTime.getTime() - startTime.getTime()) / 1000);
  const workSeconds = Math.max(0, totalSeconds - breakDurationSeconds);
  const hoursWorked = workSeconds / 3600;
  
  // Calculate earnings based on rate type and hours worked
  let earnings = 0;
  const payRate = parseFloat(shiftData.pay_rate);
  
  if (shiftData.rate_type === "Per Hour") {
    earnings = payRate * hoursWorked;
  } else if (shiftData.rate_type === "Per Day") {
    earnings = payRate;
  } else if (shiftData.rate_type === "Per Week") {
    earnings = payRate / 5; // Assuming 5-day work week
  } else if (shiftData.rate_type === "Per Month") {
    earnings = payRate / 22; // Assuming 22 working days per month
  }

  // Get break intervals for this shift
  const breakIntervals = await getBreakIntervalsForShift(shiftData.id);

  return {
    id: shiftData.id,
    date: startTime,
    employer: shiftData.employer_name,
    startTime: startTime,
    endTime: endTime,
    breakDuration: breakMinutes,
    hoursWorked: hoursWorked,
    earnings: earnings,
    payRate: payRate,
    payType: shiftData.rate_type,
    status: "Completed", // Default status
    breakIntervals: breakIntervals
  };
};
