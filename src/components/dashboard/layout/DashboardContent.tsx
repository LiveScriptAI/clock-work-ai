
import React, { useState, useMemo } from "react";
import TimeTracking from "@/components/dashboard/TimeTracking";
import DailySummary from "@/components/dashboard/DailySummary";
import TimesheetLog from "@/components/dashboard/TimesheetLog";
import BreaksSummary from "@/components/dashboard/BreaksSummary";
import InvoiceForm from "@/components/dashboard/invoice/InvoiceForm";
import CustomerTabs from "@/components/dashboard/CustomerTabs";
import { useBreakTime } from "@/hooks/useBreakTime";
import { 
  getBreakIntervalsByShift, 
  saveCurrentBreakStateAsIntervals
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
  const [refreshKey, setRefreshKey] = useState(0);

  // Get break intervals organized by shift - refresh when refreshKey changes
  const breakIntervalsByShift = useMemo(() => {
    const intervals = getBreakIntervalsByShift();
    console.log("DashboardContent - Retrieved break intervals:", intervals);
    return intervals;
  }, [refreshKey]);

  // Function to refresh break intervals after operations
  const refreshBreakIntervals = () => {
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
        <TimesheetLog importBreaksToExport={false} />
      </div>

      {/* Breaks Summary Component */}
      <div className="mt-6">
        <BreaksSummary 
          breakIntervalsByShift={breakIntervalsByShift} 
          onBreakDeleted={refreshBreakIntervals}
        />
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
