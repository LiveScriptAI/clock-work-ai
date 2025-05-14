
import React from "react";
import TimeTracking from "@/components/dashboard/TimeTracking";
import DailySummary from "@/components/dashboard/DailySummary";
import LocationMap from "@/components/dashboard/LocationMap";
import TimesheetLog from "@/components/dashboard/TimesheetLog";
import InvoiceForm from "@/components/dashboard/invoice/InvoiceForm";
import { formatCountdown } from "@/components/dashboard/utils";
import { useBreakTime } from "@/hooks/useBreakTime";

interface DashboardContentProps {
  isShiftActive: boolean;
  isBreakActive: boolean;
  isShiftComplete: boolean;
  managerName: string;
  endManagerName: string;
  startTime: Date | null;
  endTime: Date | null;
  breakStart: Date | null;
  totalBreakDuration: number;
  employerName: string;
  payRate: number;
  rateType: string;
  formatDuration: (seconds: number) => string;
  calculateTimeWorked: () => number;
  getBreakDuration: () => string;
  calculateEarnings: () => string;
  handleStartShift: () => void;
  handleEndShift: () => void;
  setIsBreakActive: (isActive: boolean) => void;
  setBreakStart: (start: Date | null) => void;
  setTotalBreakDuration: (duration: number) => void;
}

const BREAK_DURATIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
];

const DashboardContent: React.FC<DashboardContentProps> = ({
  isShiftActive,
  isBreakActive,
  isShiftComplete,
  managerName,
  endManagerName,
  startTime,
  endTime,
  breakStart,
  totalBreakDuration,
  employerName,
  payRate,
  rateType,
  formatDuration,
  calculateTimeWorked,
  getBreakDuration,
  calculateEarnings,
  handleStartShift,
  handleEndShift,
  setIsBreakActive,
  setBreakStart,
  setTotalBreakDuration
}) => {
  const breakTime = useBreakTime(
    isBreakActive,
    setIsBreakActive,
    breakStart,
    setBreakStart,
    totalBreakDuration,
    setTotalBreakDuration
  );

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
        remainingBreakTime={breakTime.remainingBreakTime}
        selectedBreakDuration={breakTime.selectedBreakDuration}
        breakMenuOpen={breakTime.breakMenuOpen}
        BREAK_DURATIONS={BREAK_DURATIONS}
        handleStartShift={handleStartShift}
        handleEndShift={handleEndShift}
        handleBreakToggle={breakTime.handleBreakToggle}
        handleBreakDurationChange={breakTime.handleBreakDurationChange}
        setBreakMenuOpen={breakTime.setBreakMenuOpen}
        formatCountdown={formatCountdown}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

        {/* Location Map Component */}
        <LocationMap />
      </div>
      
      {/* Timesheet Log Component */}
      <div className="mt-6">
        <TimesheetLog />
      </div>

      {/* Invoice Form Component */}
      <InvoiceForm />
    </>
  );
};

export default DashboardContent;
