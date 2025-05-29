
import { loadBreakState } from "./storageService";

export interface BreakInterval {
  start: string;
  end: string;
}

// Get the current shift ID from localStorage or generate one based on shift data
const getCurrentShiftId = (): string | null => {
  try {
    // Check for active shift data
    const activeShiftKey = "clockwork_active_shift";
    const activeShift = localStorage.getItem(activeShiftKey);
    if (activeShift) {
      const shiftData = JSON.parse(activeShift);
      // Create a shift ID based on start time if available
      if (shiftData.startTime) {
        return `shift_${new Date(shiftData.startTime).getTime()}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting current shift ID:", error);
    return null;
  }
};

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

// Convert current break state to intervals and save for current shift
export const saveCurrentBreakStateAsIntervals = (): void => {
  try {
    const breakState = loadBreakState();
    if (!breakState || !breakState.breakIntervals || breakState.breakIntervals.length === 0) {
      console.log("BreakIntervalsService - No break intervals to save");
      return;
    }

    // Filter completed intervals (those with both start and end)
    const completedIntervals: BreakInterval[] = breakState.breakIntervals
      .filter(interval => interval.start && interval.end)
      .map(interval => ({
        start: interval.start,
        end: interval.end
      }));

    if (completedIntervals.length === 0) {
      console.log("BreakIntervalsService - No completed break intervals to save");
      return;
    }

    // Generate a shift ID based on today's date to group breaks by day
    const today = new Date();
    const dateKey = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    const shiftId = `shift_${dateKey}`;
    
    // Check if we already have breaks for today and merge them
    const existingData = localStorage.getItem(`shift_${shiftId}_breaks`);
    let allIntervals = completedIntervals;
    
    if (existingData) {
      try {
        const parsed = JSON.parse(existingData);
        if (parsed.breakIntervals) {
          // Merge existing intervals with new ones, avoiding duplicates
          const existingIntervals = parsed.breakIntervals;
          const intervalSet = new Set();
          
          // Add existing intervals to set for deduplication
          existingIntervals.forEach((interval: BreakInterval) => {
            intervalSet.add(`${interval.start}-${interval.end}`);
          });
          
          // Only add new intervals that aren't already present
          const newIntervals = completedIntervals.filter(interval => {
            const key = `${interval.start}-${interval.end}`;
            return !intervalSet.has(key);
          });
          
          allIntervals = [...existingIntervals, ...newIntervals];
        }
      } catch (error) {
        console.error("Error parsing existing break data:", error);
      }
    }
    
    saveBreakIntervalsForShift(shiftId, allIntervals);
    console.log("BreakIntervalsService - Saved current break state as intervals:", allIntervals);
  } catch (error) {
    console.error("BreakIntervalsService - Error saving current break state:", error);
  }
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
                // Only add if we don't already have this shift ID to prevent duplicates
                if (!breakIntervalsByShift[shiftId]) {
                  breakIntervalsByShift[shiftId] = completedIntervals;
                }
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

// Create some test data for debugging
export const createTestBreakData = (): void => {
  try {
    const testIntervals: BreakInterval[] = [
      {
        start: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        end: new Date(Date.now() - 3300000).toISOString()    // 55 minutes ago (5 min break)
      },
      {
        start: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        end: new Date(Date.now() - 900000).toISOString()     // 15 minutes ago (15 min break)
      }
    ];
    
    // Use today's date for test shift ID
    const today = new Date();
    const dateKey = today.toISOString().split('T')[0];
    const testShiftId = `shift_${dateKey}`;
    
    saveBreakIntervalsForShift(testShiftId, testIntervals);
    console.log("BreakIntervalsService - Created test break data for shift:", testShiftId);
  } catch (error) {
    console.error("BreakIntervalsService - Error creating test data:", error);
  }
};
