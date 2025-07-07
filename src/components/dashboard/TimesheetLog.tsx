import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import components
import DateRangePicker from "./DateRangePicker";
import ExportActions from "./timesheet/ExportActions";
import TimeTabContent from "./timesheet/TimeTabContent";

// Import hooks
import { useTimesheetLog } from "@/hooks/useTimesheetLog";
interface TimesheetLogProps {
  importBreaksToExport?: boolean;
}
const TimesheetLog: React.FC<TimesheetLogProps> = ({
  importBreaksToExport = false
}) => {
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
  return <Card className="w-full rounded-2xl">
      <CardHeader className="p-4 flex flex-col items-center gap-4">
        <CardTitle className="text-2xl font-bold text-center">Timesheet Log</CardTitle>
        
        <ExportActions filteredShifts={filteredShifts} isLoading={isLoading} isExporting={isExporting} setIsExporting={setIsExporting} importBreaksToExport={importBreaksToExport} />
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Date Range Picker */}
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} onApplyFilter={handleApplyFilter} onResetFilter={handleResetFilter} isLoading={isLoading} />
        
        <Tabs defaultValue="day" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="day" disabled={isLoading}>Day</TabsTrigger>
            <TabsTrigger value="week" disabled={isLoading}>Week</TabsTrigger>
            <TabsTrigger value="month" disabled={isLoading}>Month</TabsTrigger>
          </TabsList>
          
          {["day", "week", "month"].map(period => <TimeTabContent key={period} period={period} activeTab={activeTab} filteredShifts={filteredShifts} isLoading={isLoading} isDateRangeActive={isDateRangeActive} error={error} onDeleteShift={handleDeleteShift} />)}
        </Tabs>
      </CardContent>
    </Card>;
};
export default TimesheetLog;