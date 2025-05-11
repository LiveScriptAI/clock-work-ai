
import { ShiftEntry } from "./types";

// Mock data for the timesheet entries
export const mockShifts: ShiftEntry[] = [
  {
    id: "1",
    date: new Date(2025, 4, 9), // May 9, 2025
    employer: "ABC Construction",
    startTime: new Date(2025, 4, 9, 8, 0), // 8:00 AM
    endTime: new Date(2025, 4, 9, 16, 30), // 4:30 PM
    breakDuration: 30, // minutes
    hoursWorked: 8,
    earnings: 120,
    payRate: 15,
    payType: "Per Hour",
    status: "Paid"
  },
  {
    id: "2",
    date: new Date(2025, 4, 8), // May 8, 2025
    employer: "XYZ Retail",
    startTime: new Date(2025, 4, 8, 9, 0), // 9:00 AM
    endTime: new Date(2025, 4, 8, 17, 0), // 5:00 PM
    breakDuration: 45, // minutes
    hoursWorked: 7.25,
    earnings: 108.75,
    payRate: 15,
    payType: "Per Hour",
    status: "Unpaid"
  },
  {
    id: "3",
    date: new Date(2025, 4, 6), // May 6, 2025
    employer: "123 Logistics",
    startTime: new Date(2025, 4, 6, 7, 30), // 7:30 AM
    endTime: new Date(2025, 4, 6, 16, 0), // 4:00 PM
    breakDuration: 60, // minutes
    hoursWorked: 7.5,
    earnings: 112.5,
    payRate: 15,
    payType: "Per Hour",
    status: "Paid"
  },
  {
    id: "4",
    date: new Date(2025, 4, 5), // May 5, 2025
    employer: "Acme Warehousing",
    startTime: new Date(2025, 4, 5, 8, 0), // 8:00 AM
    endTime: new Date(2025, 4, 5, 16, 0), // 4:00 PM
    breakDuration: 30, // minutes
    hoursWorked: 7.5,
    earnings: 150,
    payRate: 20,
    payType: "Per Hour",
    status: "Paid"
  },
  {
    id: "5",
    date: new Date(2025, 4, 4), // May 4, 2025
    employer: "Global Shipping Co.",
    startTime: new Date(2025, 4, 4, 9, 0), // 9:00 AM
    endTime: new Date(2025, 4, 4, 17, 30), // 5:30 PM
    breakDuration: 45, // minutes
    hoursWorked: 7.75,
    earnings: 775,
    payRate: 100,
    payType: "Per Day",
    status: "Unpaid"
  }
];
