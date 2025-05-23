
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger,
  TabsContent 
} from "@/components/ui/tabs";

// Import components
import DateRangePicker from "./DateRangePicker";
import ExportActions from "./timesheet/ExportActions";
import ShiftsList from "./timesheet/ShiftsList";
import { useBreakTime } from "@/hooks/useBreakTime";

// Import hooks
import { useTimesheetLog } from "@/hooks/useTimesheetLog";

const TimesheetLog: React.FC = () => {
  const {
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
  } = useTimesheetLog();
  
  // Get break intervals from the hook to pass to ShiftsList
  const { getBreakIntervals } = useBreakTime();
  const breakIntervals = getBreakIntervals();

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <CardTitle>Timesheet Log</CardTitle>
        
        <ExportActions 
          filteredShifts={filteredShifts}
          isLoading={isLoading}
          isExporting={isExporting}
          setIsExporting={setIsExporting}
        />
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
        
        <Tabs defaultValue="day" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-[300px] mb-4">
            <TabsTrigger value="day" disabled={isLoading}>Day</TabsTrigger>
            <TabsTrigger value="week" disabled={isLoading}>Week</TabsTrigger>
            <TabsTrigger value="month" disabled={isLoading}>Month</TabsTrigger>
          </TabsList>
          
          {["day", "week", "month"].map((period) => (
            <TabsContent key={period} value={period} className="mt-0">
              <ShiftsList
                shifts={filteredShifts}
                isLoading={isLoading}
                isDateRangeActive={isDateRangeActive}
                error={error}
                onDeleteShift={handleDeleteShift}
                breakIntervals={breakIntervals}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TimesheetLog;
