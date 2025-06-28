import React from "react";
import TimeTracking from "@/components/dashboard/TimeTracking";
import DailySummary from "@/components/dashboard/DailySummary";
import TimesheetLog from "@/components/dashboard/TimesheetLog";
import BreaksSummary from "@/components/dashboard/BreaksSummary";
import InvoiceForm from "@/components/dashboard/invoice/InvoiceForm";
import CustomerTabs from "@/components/dashboard/CustomerTabs";
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
  calculateEarnings
}) => {
  return <>
      {/* Time Tracking Component */}
      <TimeTracking startTime={startTime} endTime={endTime} isShiftActive={isShiftActive} isShiftComplete={isShiftComplete} managerName={managerName} endManagerName={endManagerName} handleStartShift={handleStartShift} handleEndShift={handleEndShift} />

      <div className="grid grid-cols-1 mb-6 rounded-xl">
        {/* Daily Summary Component */}
        <DailySummary formatDuration={formatDuration} calculateTimeWorked={calculateTimeWorked} getBreakDuration={() => "0 min"} // No breaks for now
      calculateEarnings={calculateEarnings} isShiftActive={isShiftActive} isShiftComplete={isShiftComplete} isBreakActive={isBreakActive} employerName={employerName} rateType={rateType} payRate={payRate} breakIntervals={breakIntervals} />
      </div>
      
      {/* Timesheet Log Component */}
      <div className="mt-6 rounded-xl">
        <TimesheetLog importBreaksToExport={false} />
      </div>

      {/* Breaks Summary Component - Now manages its own data */}
      <div className="mt-6">
        <BreaksSummary />
      </div>

      {/* Invoice Form Component */}
      <InvoiceForm />
      
      {/* Customer Tabs Component */}
      <div className="mt-6">
        <CustomerTabs />
      </div>
    </>;
};
export default DashboardContent;
