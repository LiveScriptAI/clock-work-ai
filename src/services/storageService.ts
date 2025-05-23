
// Local storage keys
const ACTIVE_SHIFT_KEY = "clockwork_active_shift";
const BREAK_STATE_KEY = "clockwork_break_state";

// Types for stored data
export interface StoredShiftState {
  isShiftActive: boolean;
  isBreakActive: boolean;
  startTime: string | null;
  breakStart: string | null;
  totalBreakDuration: number;
  managerName: string;
  employerName: string;
  payRate: number;
  rateType: string;
  startSignatureData: string | null;
}

export interface StoredBreakState {
  isBreakActive: boolean;
  selectedBreakDuration: string;
  breakIntervals: { start: string; end: string | null }[];
  remainingBreakTime: number;
  totalBreakDuration: number;
  breakStart: string | null;
  breakEnd: string | null;
  lastUpdatedAt: string;
}

// Save active shift state to localStorage
export const saveShiftState = (shiftState: StoredShiftState): void => {
  try {
    localStorage.setItem(ACTIVE_SHIFT_KEY, JSON.stringify(shiftState));
  } catch (error) {
    console.error("Error saving shift state:", error);
  }
};

// Load shift state from localStorage
export const loadShiftState = (): StoredShiftState | null => {
  try {
    const storedState = localStorage.getItem(ACTIVE_SHIFT_KEY);
    if (!storedState) return null;
    
    return JSON.parse(storedState);
  } catch (error) {
    console.error("Error loading shift state:", error);
    return null;
  }
};

// Save break state to localStorage
export const saveBreakState = (breakState: StoredBreakState): void => {
  try {
    // Always add the current timestamp when saving
    const stateWithTimestamp = {
      ...breakState,
      lastUpdatedAt: new Date().toISOString()
    };
    
    // Round values to prevent floating point issues
    if (typeof stateWithTimestamp.totalBreakDuration === 'number') {
      stateWithTimestamp.totalBreakDuration = Math.round(stateWithTimestamp.totalBreakDuration);
    }
    
    if (typeof stateWithTimestamp.remainingBreakTime === 'number') {
      stateWithTimestamp.remainingBreakTime = Math.round(stateWithTimestamp.remainingBreakTime);
    }
    
    localStorage.setItem(BREAK_STATE_KEY, JSON.stringify(stateWithTimestamp));
  } catch (error) {
    console.error("Error saving break state:", error);
  }
};

// Load break state from localStorage
export const loadBreakState = (): StoredBreakState | null => {
  try {
    const storedState = localStorage.getItem(BREAK_STATE_KEY);
    if (!storedState) return null;
    
    const parsedState = JSON.parse(storedState);
    
    // Ensure numeric values are properly typed
    if (parsedState && typeof parsedState === 'object') {
      if (parsedState.totalBreakDuration !== undefined) {
        parsedState.totalBreakDuration = Number(parsedState.totalBreakDuration);
      }
      
      if (parsedState.remainingBreakTime !== undefined) {
        parsedState.remainingBreakTime = Number(parsedState.remainingBreakTime);
      }

      // Ensure breakIntervals is an array
      if (!Array.isArray(parsedState.breakIntervals)) {
        parsedState.breakIntervals = [];
      }
    }
    
    return parsedState;
  } catch (error) {
    console.error("Error loading break state:", error);
    return null;
  }
};

// Clear shift state from localStorage
export const clearShiftState = (): void => {
  try {
    localStorage.removeItem(ACTIVE_SHIFT_KEY);
  } catch (error) {
    console.error("Error clearing shift state:", error);
  }
};

// Clear break state from localStorage
export const clearBreakState = (): void => {
  try {
    localStorage.removeItem(BREAK_STATE_KEY);
  } catch (error) {
    console.error("Error clearing break state:", error);
  }
};

// Reset break state to default values without removing from localStorage
export const resetBreakState = (): void => {
  try {
    const defaultState: StoredBreakState = {
      isBreakActive: false,
      selectedBreakDuration: "15",
      breakIntervals: [],
      remainingBreakTime: 0,
      totalBreakDuration: 0,
      breakStart: null,
      breakEnd: null,
      lastUpdatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(BREAK_STATE_KEY, JSON.stringify(defaultState));
  } catch (error) {
    console.error("Error resetting break state:", error);
  }
};
