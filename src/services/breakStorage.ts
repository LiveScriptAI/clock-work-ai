export interface StoredBreakState {
  isBreakActive: boolean;
  breakIntervals: { start: string; end: string | null }[];
  lastUpdatedAt: string;
}

const BREAK_STATE_KEY = "clockwork_break_state";

export function saveBreakState(state: StoredBreakState) {
  try {
    localStorage.setItem(BREAK_STATE_KEY, JSON.stringify(state));
  } catch { /* handle error */ }
}

export function loadBreakState(): StoredBreakState | null {
  try {
    const data = localStorage.getItem(BREAK_STATE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearBreakState() {
  try {
    localStorage.removeItem(BREAK_STATE_KEY);
  } catch { /* handle error */ }
}
