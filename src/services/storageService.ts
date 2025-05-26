// src/services/storageService.ts

// Keys for localStorage
const ACTIVE_SHIFT_KEY = "clockwork_active_shift";
const BREAK_STATE_KEY    = "clockwork_break_state";

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
  breakStart: string | null;
  breakEnd:   string | null;
  breakIntervals: { start: string; end: string | null }[];
  remainingBreakTime: number;
  totalBreakDuration: number;
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
    const raw = localStorage.getItem(ACTIVE_SHIFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error loading shift state:", error);
    return null;
  }
};

// Save break state to localStorage
export const saveBreakState = (breakState: StoredBreakState): void => {
  try {
    const stateWithTimestamp = {
      ...breakState,
      lastUpdatedAt: new Date().toISOString(),
    };

    // Round numeric fields
    stateWithTimestamp.totalBreakDuration   = Math.round(stateWithTimestamp.totalBreakDuration);
    stateWithTimestamp.remainingBreakTime   = Math.round(stateWithTimestamp.remainingBreakTime);

    localStorage.setItem(BREAK_STATE_KEY, JSON.stringify(stateWithTimestamp));
  } catch (error) {
    console.error("Error saving break state:", error);
  }
};

// Load break state from localStorage
export const loadBreakState = (): StoredBreakState | null => {
  try {
    const raw = localStorage.getItem(BREAK_STATE_KEY);
    if (!raw) return null;

    const parsed: any = JSON.parse(raw);

    // Normalize numeric fields
    parsed.totalBreakDuration   = Number(parsed.totalBreakDuration  || 0);
    parsed.remainingBreakTime   = Number(parsed.remainingBreakTime  || 0);

    // Ensure breakStart / breakEnd exist
    parsed.breakStart = parsed.breakStart ?? null;
    parsed.breakEnd   = parsed.breakEnd   ?? null;

    // Ensure breakIntervals is an array
    if (!Array.isArray(parsed.breakIntervals)) {
      parsed.breakIntervals = [];
    } else {
      parsed.breakIntervals = parsed.breakIntervals.map((i: any) => ({
        start: i.start,
        end:   i.end ?? null,
      }));
    }

    return parsed as StoredBreakState;
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

// Reset break state to defaults without removing
export const resetBreakState = (): void => {
  try {
    const defaultState: StoredBreakState = {
      isBreakActive: false,
      selectedBreakDuration: "15",
      breakStart: null,
      breakEnd:   null,
      breakIntervals: [],
      remainingBreakTime: 0,
      totalBreakDuration: 0,
      lastUpdatedAt: new Date().toISOString(),
    };
    localStorage.setItem(BREAK_STATE_KEY, JSON.stringify(defaultState));
  } catch (error) {
    console.error("Error resetting break state:", error);
  }
};

