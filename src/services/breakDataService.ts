
import { supabase } from "@/integrations/supabase/client";

export interface BreakInterval {
  id?: string;
  user_id?: string;
  shift_id: string;
  start_time: string;
  end_time: string;
  created_at?: string;
  updated_at?: string;
}

export interface BreakIntervalDisplay {
  start: string;
  end: string;
}

// Save a break interval to Supabase
export const saveBreakInterval = async (breakInterval: BreakInterval): Promise<boolean> => {
  try {
    console.log("BreakDataService - Saving break interval:", breakInterval);
    
    const { data, error } = await supabase
      .from('break_intervals')
      .insert({
        shift_id: breakInterval.shift_id,
        start_time: breakInterval.start_time,
        end_time: breakInterval.end_time,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select();

    if (error) {
      console.error("BreakDataService - Error saving break interval:", error);
      return false;
    }

    console.log("BreakDataService - Successfully saved break interval:", data);
    return true;
  } catch (error) {
    console.error("BreakDataService - Exception saving break interval:", error);
    return false;
  }
};

// Save multiple break intervals for a shift
export const saveBreakIntervalsForShift = async (shiftId: string, intervals: BreakIntervalDisplay[]): Promise<boolean> => {
  try {
    console.log("BreakDataService - Saving break intervals for shift:", shiftId, intervals);
    
    if (intervals.length === 0) {
      console.log("BreakDataService - No intervals to save");
      return true;
    }

    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      console.error("BreakDataService - No authenticated user");
      return false;
    }

    // First, delete existing intervals for this shift to avoid duplicates
    await deleteBreakIntervalsForShift(shiftId);

    // Insert new intervals
    const intervalData = intervals.map(interval => ({
      shift_id: shiftId,
      start_time: interval.start,
      end_time: interval.end,
      user_id: user.data.user!.id
    }));

    const { data, error } = await supabase
      .from('break_intervals')
      .insert(intervalData)
      .select();

    if (error) {
      console.error("BreakDataService - Error saving break intervals:", error);
      return false;
    }

    console.log("BreakDataService - Successfully saved break intervals:", data);
    return true;
  } catch (error) {
    console.error("BreakDataService - Exception saving break intervals:", error);
    return false;
  }
};

// Get all break intervals for the current user
export const getBreakIntervalsByUser = async (): Promise<Record<string, BreakIntervalDisplay[]>> => {
  try {
    console.log("BreakDataService - Getting break intervals for user");
    
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      console.error("BreakDataService - No authenticated user");
      return {};
    }

    const { data, error } = await supabase
      .from('break_intervals')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('start_time', { ascending: true });

    if (error) {
      console.error("BreakDataService - Error fetching break intervals:", error);
      return {};
    }

    console.log("BreakDataService - Retrieved break intervals:", data);

    // Group by shift_id
    const groupedIntervals: Record<string, BreakIntervalDisplay[]> = {};
    data?.forEach(interval => {
      if (!groupedIntervals[interval.shift_id]) {
        groupedIntervals[interval.shift_id] = [];
      }
      groupedIntervals[interval.shift_id].push({
        start: interval.start_time,
        end: interval.end_time
      });
    });

    console.log("BreakDataService - Grouped intervals:", groupedIntervals);
    return groupedIntervals;
  } catch (error) {
    console.error("BreakDataService - Exception fetching break intervals:", error);
    return {};
  }
};

// Get break intervals for a specific shift
export const getBreakIntervalsForShift = async (shiftId: string): Promise<BreakIntervalDisplay[]> => {
  try {
    console.log("BreakDataService - Getting break intervals for shift:", shiftId);
    
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      console.error("BreakDataService - No authenticated user");
      return [];
    }

    const { data, error } = await supabase
      .from('break_intervals')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('shift_id', shiftId)
      .order('start_time', { ascending: true });

    if (error) {
      console.error("BreakDataService - Error fetching break intervals for shift:", error);
      return [];
    }

    console.log("BreakDataService - Retrieved break intervals for shift:", data);
    
    return data?.map(interval => ({
      start: interval.start_time,
      end: interval.end_time
    })) || [];
  } catch (error) {
    console.error("BreakDataService - Exception fetching break intervals for shift:", error);
    return [];
  }
};

// Delete break intervals for a specific shift
export const deleteBreakIntervalsForShift = async (shiftId: string): Promise<boolean> => {
  try {
    console.log("BreakDataService - Deleting break intervals for shift:", shiftId);
    
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      console.error("BreakDataService - No authenticated user");
      return false;
    }

    const { error } = await supabase
      .from('break_intervals')
      .delete()
      .eq('user_id', user.data.user.id)
      .eq('shift_id', shiftId);

    if (error) {
      console.error("BreakDataService - Error deleting break intervals:", error);
      return false;
    }

    console.log("BreakDataService - Successfully deleted break intervals for shift:", shiftId);
    return true;
  } catch (error) {
    console.error("BreakDataService - Exception deleting break intervals:", error);
    return false;
  }
};

// Migrate localStorage data to Supabase
export const migrateLocalStorageToSupabase = async (): Promise<void> => {
  try {
    console.log("BreakDataService - Starting migration from localStorage to Supabase");
    
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      console.log("BreakDataService - No authenticated user, skipping migration");
      return;
    }

    // Check all localStorage keys for break data
    const breakIntervalsByShift: Record<string, BreakIntervalDisplay[]> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith('shift_') && key.endsWith('_breaks')) {
        const shiftId = key.replace('shift_', '').replace('_breaks', '');
        
        try {
          const breakData = localStorage.getItem(key);
          if (breakData) {
            const parsedData = JSON.parse(breakData);
            
            if (parsedData.breakIntervals && Array.isArray(parsedData.breakIntervals)) {
              const completedIntervals = parsedData.breakIntervals
                .filter((interval: any) => interval.start && interval.end)
                .map((interval: any) => ({
                  start: interval.start,
                  end: interval.end
                }));
              
              if (completedIntervals.length > 0) {
                breakIntervalsByShift[shiftId] = completedIntervals;
              }
            }
          }
        } catch (error) {
          console.error(`BreakDataService - Error parsing localStorage data for key ${key}:`, error);
        }
      }
    }

    console.log("BreakDataService - Found localStorage break data:", breakIntervalsByShift);

    // Save each shift's break intervals to Supabase
    for (const [shiftId, intervals] of Object.entries(breakIntervalsByShift)) {
      const success = await saveBreakIntervalsForShift(shiftId, intervals);
      if (success) {
        console.log(`BreakDataService - Successfully migrated break data for shift ${shiftId}`);
        // Optionally remove from localStorage after successful migration
        localStorage.removeItem(`shift_${shiftId}_breaks`);
      }
    }

    console.log("BreakDataService - Migration completed");
  } catch (error) {
    console.error("BreakDataService - Error during migration:", error);
  }
};
