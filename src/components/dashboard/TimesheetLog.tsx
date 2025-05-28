
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
  TabsTrigger 
} from "@/components/ui/tabs";

// Import components
import DateRangePicker from "./DateRangePicker";
import ExportActions from "./timesheet/ExportActions";
import TimeTabContent from "./timesheet/TimeTabContent";

// Import hooks
import { useTimesheetLog } from "@/hooks/useTimesheetLog";

interface TimesheetLogProps {
  importBreaksToExport?: boolean;
}

const TimesheetLog: React.FC<TimesheetLogProps> = ({ importBreaksToExport = false }) => {
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

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <CardTitle>Timesheet Log</CardTitle>
        
        <ExportActions 
          filteredShifts={filteredShifts}
          isLoading={isLoading}
          isExporting={isExporting}
          setIsExporting={setIsExporting}
          importBreaksToExport={importBreaksToExport}
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
            <TimeTabContent
              key={period}
              period={period}
              activeTab={activeTab}
              filteredShifts={filteredShifts}
              isLoading={isLoading}
              isDateRangeActive={isDateRangeActive}
              error={error}
              onDeleteShift={handleDeleteShift}
            />
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TimesheetLog;
