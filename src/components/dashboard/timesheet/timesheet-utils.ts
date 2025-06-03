import { isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ShiftEntry } from "./types";

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
