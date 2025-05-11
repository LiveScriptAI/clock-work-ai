
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
import { DateRange } from "react-day-picker";

// Import components
import DateRangePicker from "./DateRangePicker";
import ShiftsList from "./timesheet/ShiftsList";
import ExportOptions from "./timesheet/ExportOptions";

// Import utilities and data
import { filterShiftsByPeriod, filterShiftsByDateRange } from "./timesheet/timesheet-utils";
import { mockShifts } from "./timesheet/mock-data";

const TimesheetLog: React.FC = () => {
  const [activeTab, setActiveTab] = useState("day");
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDateRangeActive, setIsDateRangeActive] = useState(false);
  
  // Get all shifts filtered by active tab
  const periodFilteredShifts = useMemo(
    () => filterShiftsByPeriod(mockShifts, activeTab),
    [activeTab]
  );
  
  // Filter shifts by date range if active
  const filteredShifts = useMemo(
    () => isDateRangeActive && dateRange?.from && dateRange?.to
      ? filterShiftsByDateRange(mockShifts, dateRange.from, dateRange.to)
      : periodFilteredShifts,
    [isDateRangeActive, dateRange, periodFilteredShifts]
  );

  // Handle applying the date range filter
  const handleApplyFilter = () => {
    if (dateRange?.from && dateRange?.to) {
      setIsLoading(true);
      
      // Simulate loading delay for mock data
      setTimeout(() => {
        setIsDateRangeActive(true);
        setIsLoading(false);
      }, 800);
    }
  };

  // Handle resetting the date range filter
  const handleResetFilter = () => {
    setIsLoading(true);
    
    // Simulate loading delay for mock data
    setTimeout(() => {
      setDateRange(undefined);
      setIsDateRangeActive(false);
      setIsLoading(false);
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Timesheet Log</CardTitle>
        <ExportOptions shifts={filteredShifts} />
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
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TimesheetLog;
