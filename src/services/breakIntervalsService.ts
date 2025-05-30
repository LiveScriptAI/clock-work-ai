
import { loadBreakState } from "./storageService";

export interface BreakInterval {
  start: string;
  end: string;
}

// Save break intervals for a specific shift
export const saveBreakIntervalsForShift = (shiftId: string, intervals: BreakInterval[]): void => {
  try {
    const key = `shift_${shiftId}_breaks`;
    const breakData = {
      shiftId,
      breakIntervals: intervals,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(breakData));
    console.log("BreakIntervalsService - Saved break intervals for shift:", shiftId, intervals);
  } catch (error) {
    console.error("BreakIntervalsService - Error saving break intervals:", error);
  }
};

// Delete break intervals for a specific shift
export const deleteBreakIntervalsForShift = async (shiftId: string): Promise<boolean> => {
  try {
    const key = `shift_${shiftId}_breaks`;
    console.log("BreakIntervalsService - Deleting key:", key);
    
    // Check if the key exists before deletion
    const existingData = localStorage.getItem(key);
    if (!existingData) {
      console.log("BreakIntervalsService - Key not found:", key);
      return false;
    }
    
    localStorage.removeItem(key);
    
    // Verify deletion
    const verifyDeleted = localStorage.getItem(key);
    if (verifyDeleted === null) {
      console.log("BreakIntervalsService - Successfully deleted break intervals for shift:", shiftId);
      return true;
    } else {
      console.error("BreakIntervalsService - Failed to delete key:", key);
      return false;
    }
  } catch (error) {
    console.error("BreakIntervalsService - Error deleting break intervals:", error);
    return false;
  }
};

// Convert current break state to intervals and save for a completed shift
export const saveBreakIntervalsForCompletedShift = (shiftId: string): void => {
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
    saveBreakIntervalsForShift(shiftId, completedIntervals);
    console.log("BreakIntervalsService - Saved completed shift break intervals:", completedIntervals);
  } catch (error) {
    console.error("BreakIntervalsService - Error saving completed shift break intervals:", error);
  }
};

// Convert current break state to intervals and save for current shift (deprecated - use saveBreakIntervalsForCompletedShift instead)
export const saveCurrentBreakStateAsIntervals = (): void => {
  console.log("BreakIntervalsService - saveCurrentBreakStateAsIntervals is deprecated, use saveBreakIntervalsForCompletedShift instead");
};

// Retrieve break intervals organized by shift ID from localStorage
export const getBreakIntervalsByShift = (): Record<string, BreakInterval[]> => {
  try {
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
    
    console.log("BreakIntervalsService - Final break intervals by shift:", breakIntervalsByShift);
    console.log("BreakIntervalsService - Total shifts with breaks:", Object.keys(breakIntervalsByShift).length);
    
    return breakIntervalsByShift;
  } catch (error) {
    console.error("BreakIntervalsService - Error retrieving break intervals:", error);
    return {};
  }
};
