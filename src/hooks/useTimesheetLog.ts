
import { useState, useEffect, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { ShiftEntry } from "@/components/dashboard/timesheet/types";
import { toast } from "@/components/ui/use-toast";
import { load, save } from "@/services/localStorageService";

// Local storage service functions for shifts
const fetchUserShifts = async (): Promise<ShiftEntry[]> => {
  const shiftsHistory = load<any[]>('shiftsHistory') || [];
  const shifts = load<any[]>('shifts') || [];
  
  // Combine both sources and deduplicate
  const allShifts = [...shiftsHistory, ...shifts];
  const uniqueShifts = allShifts.filter((shift, index, arr) => 
    arr.findIndex(s => s.id === shift.id) === index
  );
  
  // Convert to ShiftEntry format
  return uniqueShifts.map(shift => ({
    id: shift.id,
    date: new Date(shift.date || shift.startTime),
    employer: shift.employer,
    startTime: new Date(shift.startTime),
    endTime: new Date(shift.endTime),
    breakDuration: shift.breakDuration || 0,
    hoursWorked: shift.hoursWorked || 0,
    earnings: shift.earnings || 0,
    payRate: shift.payRate || 0,
    payType: shift.payType || shift.rateType || "Per Hour",
    status: shift.status || "Unpaid"
  }));
};

const filterShiftsByPeriod = (shifts: ShiftEntry[], period: string): ShiftEntry[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case "day":
      return shifts.filter(shift => {
        const shiftDate = new Date(shift.date.getFullYear(), shift.date.getMonth(), shift.date.getDate());
        return shiftDate.getTime() === today.getTime();
      });
    
    case "week":
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return shifts.filter(shift => {
        const shiftDate = new Date(shift.date.getFullYear(), shift.date.getMonth(), shift.date.getDate());
        return shiftDate >= weekStart && shiftDate <= weekEnd;
      });
    
    case "month":
      return shifts.filter(shift => 
        shift.date.getMonth() === now.getMonth() && 
        shift.date.getFullYear() === now.getFullYear()
      );
    
    default:
      return shifts;
  }
};

const filterShiftsByDateRange = (shifts: ShiftEntry[], fromDate: Date, toDate: Date): ShiftEntry[] => {
  return shifts.filter(shift => {
    const shiftDate = new Date(shift.date.getFullYear(), shift.date.getMonth(), shift.date.getDate());
    const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    const to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
    
    return shiftDate >= from && shiftDate <= to;
  });
};

const deleteShift = async (shiftId: string): Promise<boolean> => {
  try {
    // Remove from shiftsHistory
    const shiftsHistory = load<any[]>('shiftsHistory') || [];
    const updatedHistory = shiftsHistory.filter(shift => shift.id !== shiftId);
    save('shiftsHistory', updatedHistory);
    
    // Remove from shifts for compatibility
    const shifts = load<any[]>('shifts') || [];
    const updatedShifts = shifts.filter(shift => shift.id !== shiftId);
    save('shifts', updatedShifts);
    
    return true;
  } catch (error) {
    console.error("Error deleting shift:", error);
    return false;
  }
};

export function useTimesheetLog() {
  const [activeTab, setActiveTab] = useState("day");
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDateRangeActive, setIsDateRangeActive] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [shifts, setShifts] = useState<ShiftEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Get all shifts filtered by active tab
  const periodFilteredShifts = useMemo(
    () => {
      console.log("Filtering shifts by period:", activeTab, "Total shifts:", shifts.length);
      const filtered = filterShiftsByPeriod(shifts, activeTab);
      console.log("Period filtered shifts:", filtered.length);
      return filtered;
    },
    [shifts, activeTab]
  );
  
  // Filter shifts by date range if active
  const filteredShifts = useMemo(
    () => {
      if (isDateRangeActive && dateRange?.from && dateRange?.to) {
        console.log("Applying date range filter:", dateRange.from, "to", dateRange.to);
        const filtered = filterShiftsByDateRange(shifts, dateRange.from, dateRange.to);
        console.log("Date range filtered shifts:", filtered.length);
        return filtered;
      }
      console.log("Using period filtered shifts:", periodFilteredShifts.length);
      return periodFilteredShifts;
    },
    [isDateRangeActive, dateRange, periodFilteredShifts, shifts]
  );

  // Fetch shifts data on component mount
  useEffect(() => {
    console.log("useTimesheetLog: Component mounted, loading shifts...");
    loadShifts();
  }, []);

  const loadShifts = async () => {
    console.log("loadShifts: Starting to fetch shifts...");
    setIsLoading(true);
    setError(null);
    
    try {
      const userShifts = await fetchUserShifts();
      console.log("loadShifts: Successfully loaded shifts:", userShifts.length);
      setShifts(userShifts);
      setError(null);
    } catch (err) {
      console.error("loadShifts: Failed to fetch shifts:", err);
      setError("Failed to load shift data");
      setShifts([]); // Ensure shifts is empty array on error
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load your timesheet data",
      });
    } finally {
      console.log("loadShifts: Setting isLoading to false");
      setIsLoading(false);
    }
  };

  // Handle deleting a shift
  const handleDeleteShift = async (shiftId: string) => {
    console.log("handleDeleteShift: Deleting shift:", shiftId);
    try {
      const success = await deleteShift(shiftId);
      
      if (success) {
        // Update state to immediately remove the deleted shift from UI
        setShifts(prevShifts => {
          const updatedShifts = prevShifts.filter(shift => shift.id !== shiftId);
          console.log("handleDeleteShift: Updated shifts count:", updatedShifts.length);
          return updatedShifts;
        });
        toast({
          title: "Success",
          description: "Shift deleted successfully",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete shift",
        });
      }
    } catch (error) {
      console.error("Error deleting shift:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while deleting the shift",
      });
    }
  };

  // Handle applying the date range filter
  const handleApplyFilter = () => {
    console.log("handleApplyFilter: Applying date range filter:", dateRange);
    if (dateRange?.from && dateRange?.to) {
      setIsLoading(true);
      
      // Simulate loading delay
      setTimeout(() => {
        setIsDateRangeActive(true);
        setIsLoading(false);
        console.log("handleApplyFilter: Date range filter applied");
      }, 300);
    }
  };

  // Handle resetting the date range filter
  const handleResetFilter = () => {
    console.log("handleResetFilter: Resetting date range filter");
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setDateRange(undefined);
      setIsDateRangeActive(false);
      setIsLoading(false);
      console.log("handleResetFilter: Date range filter reset");
    }, 200);
  };

  // Reset date range filter when tab changes
  useEffect(() => {
    if (isDateRangeActive) {
      console.log("activeTab changed, resetting date range filter");
      setIsDateRangeActive(false);
      setDateRange(undefined);
    }
  }, [activeTab]);

  // Debug logging for current state
  useEffect(() => {
    console.log("useTimesheetLog State:", {
      isLoading,
      shiftsCount: shifts.length,
      filteredShiftsCount: filteredShifts.length,
      activeTab,
      isDateRangeActive,
      error
    });
  }, [isLoading, shifts.length, filteredShifts.length, activeTab, isDateRangeActive, error]);

  return {
    activeTab,
    setActiveTab,
    isLoading,
    dateRange,
    setDateRange,
    isDateRangeActive,
    filteredShifts,
    error,
    isExporting,
    setIsExporting,
    handleDeleteShift,
    handleApplyFilter,
    handleResetFilter
  };
}
