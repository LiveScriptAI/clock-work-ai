// src/services/storageService.ts

// Local storage keys
export const ACTIVE_SHIFT_KEY   = "clockwork_active_shift";
export const CURRENT_SHIFT_KEY  = "currentShift";
export const BREAK_STATE_KEY    = "clockwork_break_state";

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
  breakIntervals: { start: string; end: string | null }[];
  totalBreakDuration: number;
  breakStart: string | null;
  lastUpdatedAt: string;
}

// Clear shift state from localStorage
export const clearShiftState = (): void => {
  try {
    localStorage.removeItem(ACTIVE_SHIFT_KEY);
    localStorage.removeItem(CURRENT_SHIFT_KEY);
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
