
// src/components/dashboard/layout/DashboardContent.tsx

import React from "react";
import SectionWrapper from "../../../components/transitions/SectionWrapper";
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
      <SectionWrapper delay={0}>
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
      </SectionWrapper>

      {/* Daily Summary */}
      <SectionWrapper delay={0}>
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
      </SectionWrapper>

      {/* Timesheet Log */}
      <SectionWrapper delay={0}>
        <TimesheetLog importBreaksToExport={false} />
      </SectionWrapper>

      {/* Invoice Form */}
      <SectionWrapper delay={0}>
        <InvoiceForm />
      </SectionWrapper>

      {/* Customer Tabs */}
      <SectionWrapper delay={0}>
        <CustomerTabs />
      </SectionWrapper>
    </div>
  );
};

export default DashboardContent;
