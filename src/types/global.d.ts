
import { ShiftEntry } from "@/components/dashboard/timesheet/types";

declare global {
  interface Window {
    _pendingAutofill?: (shiftData: ShiftEntry) => void;
  }
}

export {};
