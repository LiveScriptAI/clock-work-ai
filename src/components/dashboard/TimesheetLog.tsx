
import React, { useState, useEffect, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";

// Import components
import DateRangePicker from "./DateRangePicker";
import ShiftsList from "./timesheet/ShiftsList";

// Import utilities and data
import { downloadCSV, downloadPDF } from "./timesheet/export-utils";
import { fetchUserShifts, filterShiftsByPeriod, filterShiftsByDateRange } from "@/services/shiftService";
import { ShiftEntry } from "./timesheet/types";
import { toast } from "sonner";

const TimesheetLog: React.FC = () => {
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
    const loadShifts = async () => {
      setIsLoading(true);
      try {
        const userShifts = await fetchUserShifts();
        setShifts(userShifts);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch shifts:", err);
        setError("Failed to load shift data");
        toast.error("Could not load your timesheet data");
      } finally {
        setIsLoading(false);
      }
    };

    loadShifts();
  }, []);

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

  // Export handlers
  const handleExportCSV = () => {
    setIsExporting('csv');
    setTimeout(() => {
      downloadCSV(filteredShifts);
      setIsExporting(null);
    }, 500);
  };

  const handleExportPDF = () => {
    setIsExporting('pdf');
    setTimeout(() => {
      downloadPDF(filteredShifts);
      setIsExporting(null);
    }, 500);
  };

  // Reset date range filter when tab changes
  useEffect(() => {
    if (isDateRangeActive) {
      setIsDateRangeActive(false);
      setDateRange(undefined);
    }
  }, [activeTab]);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <CardTitle>Timesheet Log</CardTitle>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={isLoading || isExporting !== null || filteredShifts.length === 0}
            className="w-full sm:w-auto"
          >
            {isExporting === 'csv' ? 'Exporting...' : 'Download CSV'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={isLoading || isExporting !== null || filteredShifts.length === 0}
            className="w-full sm:w-auto"
          >
            {isExporting === 'pdf' ? 'Exporting...' : 'Download PDF'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Date Range Picker */}
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onApplyFilter={handleApplyFilter}
          onResetFilter={handleResetFilter}
          isLoading={isLoading}
        />
        
        <Tabs defaultValue="day" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-[300px] mb-4">
            <TabsTrigger value="day" disabled={isLoading}>Day</TabsTrigger>
            <TabsTrigger value="week" disabled={isLoading}>Week</TabsTrigger>
            <TabsTrigger value="month" disabled={isLoading}>Month</TabsTrigger>
          </TabsList>
          
          {["day", "week", "month"].map((period) => (
            <TabsContent key={period} value={period}>
              <ShiftsList
                shifts={filteredShifts}
                isLoading={isLoading}
                isDateRangeActive={isDateRangeActive}
                error={error}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TimesheetLog;
