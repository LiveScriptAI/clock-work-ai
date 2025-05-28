
import React, { useState, useMemo } from "react";
import TimeTracking from "@/components/dashboard/TimeTracking";
import DailySummary from "@/components/dashboard/DailySummary";
import TimesheetLog from "@/components/dashboard/TimesheetLog";
import BreaksSummary from "@/components/dashboard/BreaksSummary";
import InvoiceForm from "@/components/dashboard/invoice/InvoiceForm";
import CustomerTabs from "@/components/dashboard/CustomerTabs";
import { Button } from "@/components/ui/button";
import { useBreakTime } from "@/hooks/useBreakTime";
import { 
  getBreakIntervalsByShift, 
  saveCurrentBreakStateAsIntervals,
  createTestBreakData 
} from "@/services/breakIntervalsService";

interface DashboardContentProps {
  // Shift state
  startTime: Date | null;
  endTime: Date | null;
  isShiftActive: boolean;
  isShiftComplete: boolean;
  managerName: string;
  endManagerName: string;
  employerName: string;
  rateType: string;
  payRate: number;
  
  // Functions
  handleStartShift: () => void;
  handleEndShift: () => void;
  formatCountdown: (seconds: number) => string;
  formatDuration: (seconds: number) => string;
  calculateTimeWorked: () => number;
  calculateEarnings: () => string;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  startTime,
  endTime,
  isShiftActive,
  isShiftComplete,
  managerName,
  endManagerName,
  employerName,
  rateType,
  payRate,
  handleStartShift,
  handleEndShift,
  formatCountdown,
  formatDuration,
  calculateTimeWorked,
  calculateEarnings,
}) => {
  const { breakIntervals, isBreakActive } = useBreakTime();
  const [importBreaksToExport, setImportBreaksToExport] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get break intervals organized by shift - refresh when refreshKey changes
  const breakIntervalsByShift = useMemo(() => {
    const intervals = getBreakIntervalsByShift();
    console.log("DashboardContent - Retrieved break intervals:", intervals);
    return intervals;
  }, [refreshKey]);

  const handleImportBreaksToggle = () => {
    setImportBreaksToExport(prev => {
      const newValue = !prev;
      console.log("DashboardContent - Import breaks to export toggled:", newValue);
      console.log("DashboardContent - Available break intervals:", breakIntervalsByShift);
      console.log("DashboardContent - Number of shifts with breaks:", Object.keys(breakIntervalsByShift).length);
      
      // If turning on, try to save current break state as intervals
      if (newValue) {
        saveCurrentBreakStateAsIntervals();
        // Refresh the break intervals after saving
        setRefreshKey(prev => prev + 1);
      }
      
      return newValue;
    });
  };

  const handleCreateTestData = () => {
    createTestBreakData();
    setRefreshKey(prev => prev + 1);
    console.log("DashboardContent - Test break data created and refreshed");
  };

  const handleRefreshBreaks = () => {
    setRefreshKey(prev => prev + 1);
    console.log("DashboardContent - Break intervals refreshed");
  };

  return (
    <>
      {/* Time Tracking Component */}
      <TimeTracking 
        startTime={startTime}
        endTime={endTime}
        isShiftActive={isShiftActive}
        isShiftComplete={isShiftComplete}
        managerName={managerName}
        endManagerName={endManagerName}
        handleStartShift={handleStartShift}
        handleEndShift={handleEndShift}
      />

      <div className="grid grid-cols-1 mb-6">
        {/* Daily Summary Component */}
        <DailySummary 
          formatDuration={formatDuration}
          calculateTimeWorked={calculateTimeWorked}
          getBreakDuration={() => "0 min"} // No breaks for now
          calculateEarnings={calculateEarnings}
          isShiftActive={isShiftActive}
          isShiftComplete={isShiftComplete}
          isBreakActive={isBreakActive}
          employerName={employerName}
          rateType={rateType}
          payRate={payRate}
          breakIntervals={breakIntervals}
        />
      </div>
      
      {/* Timesheet Log Component */}
      <div className="mt-6">
        <TimesheetLog importBreaksToExport={importBreaksToExport} />
      </div>

      {/* Import Breaks Toggle Button */}
      <div className="mt-6 flex justify-center gap-2">
        <Button
          variant={importBreaksToExport ? "default" : "outline"}
          onClick={handleImportBreaksToggle}
          className="flex items-center gap-2"
        >
          {importBreaksToExport ? "✓ Breaks Included in Export" : "Import Breaks to CSV/PDF"}
        </Button>
        
        {/* Debug buttons */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshBreaks}
          className="text-xs"
        >
          Refresh Breaks
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateTestData}
          className="text-xs"
        >
          Create Test Data
        </Button>
      </div>

      {/* Breaks Summary Component */}
      <div className="mt-6">
        <BreaksSummary breakIntervalsByShift={breakIntervalsByShift} />
      </div>

      {/* Invoice Form Component */}
      <InvoiceForm />
      
      {/* Customer Tabs Component */}
      <div className="mt-6">
        <CustomerTabs />
      </div>
    </>
  );
};

export default DashboardContent;
