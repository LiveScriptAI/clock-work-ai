import { useState, useEffect, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { ShiftEntry } from "@/components/dashboard/timesheet/types";
import { toast } from "@/components/ui/use-toast";
import { 
  fetchUserShifts, 
  filterShiftsByPeriod, 
  filterShiftsByDateRange,
  deleteShift 
} from "@/services/shiftService";
import { loadBreakState } from "@/services/storageService";

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
    () => filterShiftsByPeriod(shifts, activeTab),
    [shifts, activeTab]
  );
  
  // Filter shifts by date range if active
  const filteredShifts = useMemo(
    () => isDateRangeActive && dateRange?.from && dateRange?.to
      ? filterShiftsByDateRange(shifts, dateRange.from, dateRange.to)
      : periodFilteredShifts,
    [isDateRangeActive, dateRange, periodFilteredShifts]
  );

  // Fetch shifts data on component mount
  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    setIsLoading(true);
    try {
      const userShifts = await fetchUserShifts();
      
      // Debug logging
      console.log("useTimesheetLog - loaded shifts:", userShifts.length);
      
      // Enhance shifts with break intervals from localStorage if available
      const enhancedShifts = userShifts.map(shift => {
        const shiftKey = `shift_${shift.id}_breaks`;
        const storedBreakData = localStorage.getItem(shiftKey);
        
        console.log(`useTimesheetLog - checking localStorage for ${shiftKey}:`, storedBreakData);
        
        let breakIntervals: { start: string; end: string | null }[] | undefined = undefined;
        if (storedBreakData) {
          try {
            const parsedData = JSON.parse(storedBreakData);
            console.log(`useTimesheetLog - parsed break data for shift ${shift.id}:`, parsedData);
            
            // Only set breakIntervals if there's actual data
            if (parsedData && Array.isArray(parsedData) && parsedData.length > 0) {
              // Convert to consistent ISO string format
              breakIntervals = parsedData.map((interval: any) => ({
                start: interval.start instanceof Date ? interval.start.toISOString() : interval.start,
                end: interval.end ? (interval.end instanceof Date ? interval.end.toISOString() : interval.end) : null
              }));
            }
          } catch (error) {
            console.error("Error parsing stored break data:", error);
          }
        }
        
        const enhancedShift = {
          ...shift,
          ...(breakIntervals && { breakIntervals })
        };
        
        console.log(`useTimesheetLog - enhanced shift ${shift.id}:`, {
          hasBreakIntervals: !!enhancedShift.breakIntervals,
          breakIntervalsCount: enhancedShift.breakIntervals?.length || 0,
          breakIntervals: enhancedShift.breakIntervals
        });
        
        return enhancedShift;
      });
      
      setShifts(enhancedShifts);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch shifts:", err);
      setError("Failed to load shift data");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load your timesheet data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a shift
  const handleDeleteShift = async (shiftId: string) => {
    try {
      const success = await deleteShift(shiftId);
      
      if (success) {
        // Also clean up stored break intervals for this shift
        const shiftKey = `shift_${shiftId}_breaks`;
        localStorage.removeItem(shiftKey);
        
        // Update state to immediately remove the deleted shift from UI
        setShifts(prevShifts => prevShifts.filter(shift => shift.id !== shiftId));
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
    if (dateRange?.from && dateRange?.to) {
      setIsLoading(true);
      
      // Simulate loading delay
      setTimeout(() => {
        setIsDateRangeActive(true);
        setIsLoading(false);
      }, 300);
    }
  };

  // Handle resetting the date range filter
  const handleResetFilter = () => {
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setDateRange(undefined);
      setIsDateRangeActive(false);
      setIsLoading(false);
    }, 200);
  };

  // Reset date range filter when tab changes
  useEffect(() => {
    if (isDateRangeActive) {
      setIsDateRangeActive(false);
      setDateRange(undefined);
    }
  }, [activeTab]);

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
