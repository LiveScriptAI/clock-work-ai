
import React from "react";
import TimeTracking from "@/components/dashboard/TimeTracking";
import DailySummary from "@/components/dashboard/DailySummary";
import TimesheetLog from "@/components/dashboard/TimesheetLog";
import InvoiceForm from "@/components/dashboard/invoice/InvoiceForm";
import CustomerTabs from "@/components/dashboard/CustomerTabs";

interface DashboardContentProps {
  // Shift state
  startTime: Date | null;
  endTime: Date | null;
  isShiftActive: boolean;
  isShiftComplete: boolean;
  isBreakActive: boolean;
  managerName: string;
  endManagerName: string;
  breakStart: Date | null;
  remainingBreakTime: number;
  selectedBreakDuration: string;
  breakMenuOpen: boolean;
  BREAK_DURATIONS: Array<{ value: string; label: string }>;
  employerName: string;
  rateType: string;
  payRate: number;
  
  // Functions
  handleStartShift: () => void;
  handleEndShift: () => void;
  handleBreakToggle: () => void;
  handleBreakDurationChange: (duration: string) => void;
  setBreakMenuOpen: (open: boolean) => void;
  formatCountdown: (seconds: number) => string;
  getBreakDuration: () => string;
  formatDuration: (seconds: number) => string;
  calculateTimeWorked: () => number;
  calculateEarnings: () => string;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  startTime,
  endTime,
  isShiftActive,
  isShiftComplete,
  isBreakActive,
  managerName,
  endManagerName,
  breakStart,
  remainingBreakTime,
  selectedBreakDuration,
  breakMenuOpen,
  BREAK_DURATIONS,
  employerName,
  rateType,
  payRate,
  handleStartShift,
  handleEndShift,
  handleBreakToggle,
  handleBreakDurationChange,
  setBreakMenuOpen,
  formatCountdown,
  getBreakDuration,
  formatDuration,
  calculateTimeWorked,
  calculateEarnings,
}) => {
  return (
    <>
      {/* Time Tracking Component */}
      <TimeTracking 
        startTime={startTime}
        endTime={endTime}
        isShiftActive={isShiftActive}
        isShiftComplete={isShiftComplete}
        isBreakActive={isBreakActive}
        managerName={managerName}
        endManagerName={endManagerName}
        breakStart={breakStart}
        remainingBreakTime={remainingBreakTime}
        selectedBreakDuration={selectedBreakDuration}
        breakMenuOpen={breakMenuOpen}
        BREAK_DURATIONS={BREAK_DURATIONS}
        handleStartShift={handleStartShift}
        handleEndShift={handleEndShift}
        handleBreakToggle={handleBreakToggle}
        handleBreakDurationChange={handleBreakDurationChange}
        setBreakMenuOpen={setBreakMenuOpen}
        getBreakDuration={getBreakDuration}
        formatCountdown={formatCountdown}
      />

      <div className="grid grid-cols-1 mb-6">
        {/* Daily Summary Component */}
        <DailySummary 
          formatDuration={formatDuration}
          calculateTimeWorked={calculateTimeWorked}
          getBreakDuration={getBreakDuration}
          calculateEarnings={calculateEarnings}
          isShiftActive={isShiftActive}
          isShiftComplete={isShiftComplete}
          isBreakActive={isBreakActive}
          employerName={employerName}
          rateType={rateType}
          payRate={payRate}
        />
      </div>
      
      {/* Timesheet Log Component */}
      <div className="mt-6">
        <TimesheetLog />
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
