
import { loadBreakState } from "./storageService";
import { 
  getBreakIntervalsByUser, 
  saveBreakIntervalsForShift as saveBreakIntervalsToSupabase,
  deleteBreakIntervalsForShift as deleteBreakIntervalsFromSupabase,
  migrateLocalStorageToSupabase,
  BreakIntervalDisplay
} from "./breakDataService";

export interface BreakInterval {
  start: string;
  end: string;
}

// Save break intervals for a specific shift (now uses Supabase)
export const saveBreakIntervalsForShift = async (shiftId: string, intervals: BreakInterval[]): Promise<void> => {
  try {
    console.log("BreakIntervalsService - Saving break intervals for shift:", shiftId, intervals);
    
    const success = await saveBreakIntervalsToSupabase(shiftId, intervals);
    if (success) {
      console.log("BreakIntervalsService - Successfully saved to Supabase");
    } else {
      console.error("BreakIntervalsService - Failed to save to Supabase, falling back to localStorage");
      // Fallback to localStorage if Supabase fails
      const key = `shift_${shiftId}_breaks`;
      const breakData = {
        shiftId,
        breakIntervals: intervals,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(breakData));
    }
  } catch (error) {
    console.error("BreakIntervalsService - Error saving break intervals:", error);
  }
};

// Delete break intervals for a specific shift (now uses Supabase)
export const deleteBreakIntervalsForShift = async (shiftId: string): Promise<boolean> => {
  try {
    console.log("BreakIntervalsService - Deleting break intervals for shift:", shiftId);
    
    const success = await deleteBreakIntervalsFromSupabase(shiftId);
    if (success) {
      console.log("BreakIntervalsService - Successfully deleted from Supabase");
      // Also remove from localStorage as backup
      const key = `shift_${shiftId}_breaks`;
      localStorage.removeItem(key);
      return true;
    } else {
      console.error("BreakIntervalsService - Failed to delete from Supabase, trying localStorage");
      // Fallback to localStorage
      const key = `shift_${shiftId}_breaks`;
      localStorage.removeItem(key);
      return true;
    }
  } catch (error) {
    console.error("BreakIntervalsService - Error deleting break intervals:", error);
    return false;
  }
};

// Convert current break state to intervals and save for a completed shift
export const saveBreakIntervalsForCompletedShift = async (shiftId: string): Promise<void> => {
  try {
    console.log("BreakIntervalsService - Loading break state for shift:", shiftId);
    const breakState = loadBreakState();
    
    if (!breakState || !breakState.breakIntervals || breakState.breakIntervals.length === 0) {
      console.log("BreakIntervalsService - No break intervals to save for completed shift");
      return;
    }

    console.log("BreakIntervalsService - Raw break intervals from state:", breakState.breakIntervals);

    // Filter completed intervals (those with both start and end)
    const completedIntervals: BreakInterval[] = breakState.breakIntervals
      .filter(interval => {
        const hasStart = interval.start && interval.start !== null;
        const hasEnd = interval.end && interval.end !== null;
        console.log("BreakIntervalsService - Checking interval:", interval, "hasStart:", hasStart, "hasEnd:", hasEnd);
        return hasStart && hasEnd;
      })
      .map(interval => ({
        start: interval.start,
        end: interval.end!
      }));

    console.log("BreakIntervalsService - Completed intervals:", completedIntervals);

    if (completedIntervals.length === 0) {
      console.log("BreakIntervalsService - No completed break intervals to save for shift");
      return;
    }

    // Save breaks for this specific completed shift
    await saveBreakIntervalsForShift(shiftId, completedIntervals);
    console.log("BreakIntervalsService - Saved completed shift break intervals:", completedIntervals);
  } catch (error) {
    console.error("BreakIntervalsService - Error saving completed shift break intervals:", error);
  }
};

// Convert current break state to intervals and save for current shift (deprecated - use saveBreakIntervalsForCompletedShift instead)
export const saveCurrentBreakStateAsIntervals = (): void => {
  console.log("BreakIntervalsService - saveCurrentBreakStateAsIntervals is deprecated, use saveBreakIntervalsForCompletedShift instead");
};

// Retrieve break intervals organized by shift ID (now from Supabase with localStorage fallback)
export const getBreakIntervalsByShift = async (): Promise<Record<string, BreakInterval[]>> => {
  try {
    console.log("BreakIntervalsService - Getting break intervals by shift");
    
    // Try to get data from Supabase first
    const supabaseData = await getBreakIntervalsByUser();
    console.log("BreakIntervalsService - Data from Supabase:", supabaseData);

    if (Object.keys(supabaseData).length > 0) {
      // If we have Supabase data, migrate any remaining localStorage data and return Supabase data
      await migrateLocalStorageToSupabase();
      return supabaseData;
    }

    // Fallback to localStorage if no Supabase data
    console.log("BreakIntervalsService - No Supabase data, checking localStorage");
    const breakIntervalsByShift: Record<string, BreakInterval[]> = {};
    
    console.log("BreakIntervalsService - Starting localStorage scan...");
    console.log("BreakIntervalsService - localStorage length:", localStorage.length);
    
    // Check all localStorage keys for break data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith('shift_') && key.endsWith('_breaks')) {
        console.log("BreakIntervalsService - Found break key:", key);
        
        // Extract shift ID from key format: shift_{shiftId}_breaks
        const shiftId = key.replace('shift_', '').replace('_breaks', '');
        console.log("BreakIntervalsService - Extracted shift ID:", shiftId);
        
        try {
          const breakData = localStorage.getItem(key);
          if (breakData) {
            const parsedData = JSON.parse(breakData);
            console.log("BreakIntervalsService - Parsed break data for shift", shiftId, ":", parsedData);
            
            // Extract completed break intervals
            if (parsedData.breakIntervals && Array.isArray(parsedData.breakIntervals)) {
              const completedIntervals = parsedData.breakIntervals
                .filter((interval: any) => interval.start && interval.end)
                .map((interval: any) => ({
                  start: interval.start,
                  end: interval.end
                }));
              
              console.log("BreakIntervalsService - Completed intervals for shift", shiftId, ":", completedIntervals);
              
              if (completedIntervals.length > 0) {
                breakIntervalsByShift[shiftId] = completedIntervals;
              }
            }
          }
        } catch (error) {
          console.error(`BreakIntervalsService - Error parsing break data for key ${key}:`, error);
        }
      }
    }
    
    console.log("BreakIntervalsService - Final break intervals by shift from localStorage:", breakIntervalsByShift);
    
    // If we found localStorage data, migrate it to Supabase
    if (Object.keys(breakIntervalsByShift).length > 0) {
      console.log("BreakIntervalsService - Found localStorage data, triggering migration");
      await migrateLocalStorageToSupabase();
    }
    
    return breakIntervalsByShift;
  } catch (error) {
    console.error("BreakIntervalsService - Error retrieving break intervals:", error);
    return {};
  }
};
