
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
  breakStartTime: string | null;
  remainingBreakTime: number;
  totalBreakDuration: number;
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
    localStorage.setItem(BREAK_STATE_KEY, JSON.stringify(breakState));
  } catch (error) {
    console.error("Error saving break state:", error);
  }
};

// Load break state from localStorage
export const loadBreakState = (): StoredBreakState | null => {
  try {
    const storedState = localStorage.getItem(BREAK_STATE_KEY);
    if (!storedState) return null;
    
    return JSON.parse(storedState);
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
