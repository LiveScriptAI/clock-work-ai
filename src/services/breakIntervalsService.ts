
import { loadBreakState } from "./storageService";

export interface BreakInterval {
  start: string;
  end: string;
}

// Retrieve break intervals organized by shift ID from localStorage
export const getBreakIntervalsByShift = (): Record<string, BreakInterval[]> => {
  try {
    const breakIntervalsByShift: Record<string, BreakInterval[]> = {};
    
    // Check all localStorage keys for break data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith('shift_') && key.endsWith('_breaks')) {
        // Extract shift ID from key format: shift_{shiftId}_breaks
        const shiftId = key.replace('shift_', '').replace('_breaks', '');
        
        try {
          const breakData = localStorage.getItem(key);
          if (breakData) {
            const parsedData = JSON.parse(breakData);
            
            // Extract completed break intervals
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
          console.error(`Error parsing break data for key ${key}:`, error);
        }
      }
    }
    
    console.log("Retrieved break intervals by shift:", breakIntervalsByShift);
    return breakIntervalsByShift;
  } catch (error) {
    console.error("Error retrieving break intervals:", error);
    return {};
  }
};
