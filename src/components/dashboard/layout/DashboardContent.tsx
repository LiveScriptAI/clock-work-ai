// src/components/dashboard/layout/DashboardContent.tsx

import React from "react";
import TimeTracking from "@/components/dashboard/TimeTracking";
import DailySummary from "@/components/dashboard/DailySummary";
import TimesheetLog from "@/components/dashboard/TimesheetLog";
import InvoiceForm from "@/components/dashboard/invoice/InvoiceForm";
import CustomerTabs from "@/components/dashboard/CustomerTabs";

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
          isShiftActive={isShiftActive}
          isShiftComplete={isShiftComplete}
          formatDuration={formatDuration}
          calculateTimeWorked={calculateTimeWorked}
          calculateEarnings={calculateEarnings}
          rateType={rateType}
          payRate={payRate}
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
