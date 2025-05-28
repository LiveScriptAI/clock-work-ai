
import { loadBreakState } from "./storageService";

export interface BreakInterval {
  start: string;
  end: string;
}

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
