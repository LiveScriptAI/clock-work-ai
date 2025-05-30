
export interface ShiftEntry {
  id: string;
  date: Date;
  employer: string;
  startTime: Date;
  endTime: Date;
  breakDuration: number; // minutes - keep for compatibility
  hoursWorked: number;
  earnings: number;
  payRate: number;
  payType: string;
  status: string;
  breakIntervals?: { start: string; end: string }[];
  clientEmail?: string; // Add optional client email field
}
