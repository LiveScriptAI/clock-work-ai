// Local storage keys
const ACTIVE_SHIFT_KEY = "clockwork_active_shift";
const CURRENT_SHIFT_KEY = "currentShift";    // <— add this
const BREAK_STATE_KEY  = "clockwork_break_state";

// … (your StoredShiftState and StoredBreakState interfaces remain unchanged)

// Clear shift state from localStorage
export const clearShiftState = (): void => {
  try {
    localStorage.removeItem(ACTIVE_SHIFT_KEY);
    localStorage.removeItem(CURRENT_SHIFT_KEY); // also clear the “currentShift” key
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

// (rest of file stays the same)
