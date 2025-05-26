
import { supabase } from "@/integrations/supabase/client";
import { ShiftEntry } from "@/components/dashboard/timesheet/types";
import { startOfDay, endOfDay, subDays } from "date-fns";

// Fetch shifts for the current authenticated user
export async function fetchUserShifts(): Promise<ShiftEntry[]> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("user_id", session.session.user.id)
      .order("start_time", { ascending: false });

    if (error) {
      throw error;
    }

    // Transform data to match ShiftEntry interface
    return data.map(transformShiftData);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return [];
  }
}

// Delete a shift by ID
export async function deleteShift(shiftId: string): Promise<boolean> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) {
      throw new Error("User not authenticated");
    }
    
    const { error } = await supabase
      .from("shifts")
      .delete()
      .eq("id", shiftId)
      .eq("user_id", session.session.user.id); // Ensure user can only delete their own shifts
    
    if (error) {
      console.error("Error deleting shift:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception when deleting shift:", error);
    return false;
  }
}

// Get shifts filtered by time period (day, week, month)
export function filterShiftsByPeriod(shifts: ShiftEntry[], period: string): ShiftEntry[] {
  const now = new Date();
  
  switch (period) {
    case "day":
      return shifts.filter(shift => 
        shift.date.getDate() === now.getDate() &&
        shift.date.getMonth() === now.getMonth() &&
        shift.date.getFullYear() === now.getFullYear()
      );
    case "week":
      const oneWeekAgo = subDays(now, 7);
      return shifts.filter(shift => shift.date >= oneWeekAgo);
    case "month":
      return shifts.filter(shift => 
        shift.date.getMonth() === now.getMonth() &&
        shift.date.getFullYear() === now.getFullYear()
      );
    default:
      return shifts;
  }
}

// Filter shifts by date range
export function filterShiftsByDateRange(
  shifts: ShiftEntry[],
  fromDate: Date,
  toDate: Date
): ShiftEntry[] {
  return shifts.filter(shift => {
    const shiftDate = startOfDay(shift.date);
    return shiftDate >= startOfDay(fromDate) && shiftDate <= endOfDay(toDate);
  });
}

// Transform Supabase shift data to ShiftEntry format
function transformShiftData(shiftData: any): ShiftEntry {
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
    status: "Completed" // Default status
  };
}
