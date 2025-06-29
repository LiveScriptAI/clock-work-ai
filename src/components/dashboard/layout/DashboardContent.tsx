
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
    <>
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
      <div className="grid grid-cols-1 mb-6 rounded-xl">
        <DailySummary
          employerName={employerName}
          startTime={startTime}
          endTime={endTime}
          isShiftActive={isShiftActive}
          isShiftComplete={isShiftComplete}
          rateType={rateType}
          payRate={payRate}
          totalBreakDuration={0}
        />
      </div>

      {/* Timesheet Log */}
      <div className="mt-6 rounded-xl">
        <TimesheetLog importBreaksToExport={false} />
      </div>

      {/* Invoice Form */}
      <div className="mt-6">
        <InvoiceForm />
      </div>

      {/* Customer Tabs */}
      <div className="mt-6">
        <CustomerTabs />
      </div>
    </>
  );
};

export default DashboardContent;
