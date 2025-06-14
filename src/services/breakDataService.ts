import { supabase } from "@/integrations/supabase/client";

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

// Save break intervals for a completed shift to Supabase
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

    // Delete existing intervals for this shift first to avoid duplicates
    await supabase
      .from('break_intervals')
      .delete()
      .eq('shift_id', shiftId)
      .eq('user_id', userId);

    // Insert new intervals
    const breakData = intervals.map(interval => ({
      shift_id: shiftId,
      user_id: userId,
      start_time: interval.start,
      end_time: interval.end
    }));

    const { error } = await supabase
      .from('break_intervals')
      .insert(breakData);

    if (error) {
      console.error("BreakDataService - Error saving break intervals:", error);
      return false;
    }

    console.log("BreakDataService - Successfully saved break intervals to Supabase");
    return true;
  } catch (error) {
    console.error("BreakDataService - Error in saveBreakIntervalsToSupabase:", error);
    return false;
  }
};

// Fetch all break intervals organized by shift ID from Supabase
export const getBreakIntervalsFromSupabase = async (userId: string): Promise<Record<string, BreakInterval[]>> => {
  try {
    if (!userId) {
      console.log("BreakDataService - No user ID provided");
      return {};
    }

    const { data, error } = await supabase
      .from('break_intervals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("BreakDataService - Error fetching break intervals:", error);
      return {};
    }

    // Group intervals by shift_id
    const intervalsByShift: Record<string, BreakInterval[]> = {};
    
    data?.forEach((item: BreakData) => {
      if (!intervalsByShift[item.shift_id]) {
        intervalsByShift[item.shift_id] = [];
      }
      
      intervalsByShift[item.shift_id].push({
        start: item.start_time,
        end: item.end_time
      });
    });

    console.log("BreakDataService - Retrieved break intervals from Supabase:", intervalsByShift);
    return intervalsByShift;
  } catch (error) {
    console.error("BreakDataService - Error in getBreakIntervalsFromSupabase:", error);
    return {};
  }
};

// Delete break intervals for a specific shift from Supabase
export const deleteBreakIntervalsFromSupabase = async (
  shiftId: string, 
  userId: string
): Promise<boolean> => {
  try {
    if (!userId) {
      console.log("BreakDataService - No user ID provided for deletion");
      return false;
    }

    const { error } = await supabase
      .from('break_intervals')
      .delete()
      .eq('shift_id', shiftId)
      .eq('user_id', userId);

    if (error) {
      console.error("BreakDataService - Error deleting break intervals:", error);
      return false;
    }

    console.log("BreakDataService - Successfully deleted break intervals for shift:", shiftId);
    return true;
  } catch (error) {
    console.error("BreakDataService - Error in deleteBreakIntervalsFromSupabase:", error);
    return false;
  }
};
