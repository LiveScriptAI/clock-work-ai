
// src/components/dashboard/layout/DashboardContent.tsx

import React from "react";
import TimeTracking   from "../TimeTracking";
import DailySummary  from "../DailySummary";
import TimesheetLog  from "../TimesheetLog";
import InvoiceForm   from "../invoice/InvoiceForm";
import CustomerTabs  from "../CustomerTabs";

interface DashboardContentProps {
  startTime: Date | null;
  endTime: Date | null;
  isShiftActive: boolean;
  isShiftComplete: boolean;
  managerName: string;
  endManagerName: string;
  employerName: string;
  rateType: string;
  payRate: number;

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
  return (
    <div className="space-y-4">
      {/* Time Tracking */}
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

      {/* Daily Summary */}
      <DailySummary
        employerName={employerName}
        startTime={startTime}
        endTime={endTime}
        isShiftActive={isShiftActive}
        isShiftComplete={isShiftComplete}
        formatDuration={formatDuration}
        calculateTimeWorked={calculateTimeWorked}
        calculateEarnings={calculateEarnings}
        rateType={rateType}
        payRate={payRate}
      />

      {/* Timesheet Log */}
      <TimesheetLog importBreaksToExport={false} />

      {/* Invoice Form */}
      <InvoiceForm />

      {/* Customer Tabs */}
      <CustomerTabs />
    </div>
  );
};

export default DashboardContent;
