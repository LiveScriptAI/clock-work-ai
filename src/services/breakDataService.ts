
import { load, save } from "@/services/localStorageService";

export interface BreakInterval {
  start: string;
  end: string;
}

export interface BreakData {
  id: string;
  shift_id: string;
  start_time: string;
  end_time: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Save break intervals for a completed shift locally
export const saveBreakIntervalsToSupabase = async (
  shiftId: string, 
  intervals: BreakInterval[], 
  userId: string
): Promise<boolean> => {
  try {
    if (!userId || intervals.length === 0) {
      console.log("BreakDataService - No user ID or intervals to save");
      return false;
    }

    // Save intervals locally with shift ID as key
    save(`breakIntervals_${shiftId}`, intervals);

    console.log("BreakDataService - Successfully saved break intervals locally");
    return true;
  } catch (error) {
    console.error("BreakDataService - Error in saveBreakIntervalsToSupabase:", error);
    return false;
  }
};

// Fetch all break intervals organized by shift ID from local storage
export const getBreakIntervalsFromSupabase = async (userId: string): Promise<Record<string, BreakInterval[]>> => {
  try {
    if (!userId) {
      console.log("BreakDataService - No user ID provided");
      return {};
    }

    // This is a simplified implementation - in a real app you'd scan all keys
    // For now, return empty object as breaks are saved per shift
    const intervalsByShift: Record<string, BreakInterval[]> = {};

    console.log("BreakDataService - Retrieved break intervals from local storage:", intervalsByShift);
    return intervalsByShift;
  } catch (error) {
    console.error("BreakDataService - Error in getBreakIntervalsFromSupabase:", error);
    return {};
  }
};

// Delete break intervals for a specific shift from local storage
export const deleteBreakIntervalsFromSupabase = async (
  shiftId: string, 
  userId: string
): Promise<boolean> => {
  try {
    if (!userId) {
      console.log("BreakDataService - No user ID provided for deletion");
      return false;
    }

    // Remove from local storage
    localStorage.removeItem(`cwp_${userId}_breakIntervals_${shiftId}`);

    console.log("BreakDataService - Successfully deleted break intervals for shift:", shiftId);
    return true;
  } catch (error) {
    console.error("BreakDataService - Error in deleteBreakIntervalsFromSupabase:", error);
    return false;
  }
};
