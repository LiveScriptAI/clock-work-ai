import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useShiftState } from "@/hooks/useShiftState";
import { useBreakTime } from "@/hooks/useBreakTime";

// Import components
import Header from "@/components/dashboard/Header";
import Navigation from "@/components/dashboard/Navigation";
import TimeTracking from "@/components/dashboard/TimeTracking";
import DailySummary from "@/components/dashboard/DailySummary";
import LocationMap from "@/components/dashboard/LocationMap";
import TimesheetLog from "@/components/dashboard/TimesheetLog";
import InvoiceForm from "@/components/dashboard/invoice/InvoiceForm";
import StartShiftDialog from "@/components/dashboard/StartShiftDialog";
import EndShiftDialog from "@/components/dashboard/EndShiftDialog";
import ValidationAlert from "@/components/dashboard/ValidationAlert";

// Import utility functions
import { 
  formatDuration, 
  formatCountdown, 
  calculateTimeWorked as calculateTimeWorkedUtil,
  calculateEarnings as calculateEarningsUtil,
  getBreakDuration as getBreakDurationUtil
} from "@/components/dashboard/utils";

const BREAK_DURATIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
];

const DashboardPage = () => {
  const { user, handleSignOut } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [language, setLanguage] = useState("english");
  
  const shiftState = useShiftState();
  const {
    isShiftActive, isBreakActive, isStartSignatureOpen, isEndSignatureOpen, isShiftComplete,
    managerName, endManagerName, startTime, endTime, breakStart, totalBreakDuration,
    employerName, payRate, rateType, setManagerName, setEndManagerName,
    setIsStartSignatureEmpty, setIsEndSignatureEmpty, showValidationAlert,
    setShowValidationAlert, validationType, setIsStartSignatureOpen, setIsEndSignatureOpen,
    handleStartShift, handleEndShift, confirmShiftStart, 
    setEmployerName, setPayRate, setRateType, setStartSignatureData, setEndSignatureData
  } = shiftState;

  const breakTime = useBreakTime(
    isBreakActive,
    shiftState.setIsBreakActive,
    breakStart,
    shiftState.setBreakStart,
    totalBreakDuration,
    shiftState.setTotalBreakDuration
  );

  // Utility wrapper functions that use component state
  const calculateTimeWorked = () => 
    calculateTimeWorkedUtil(startTime, endTime, totalBreakDuration);

  const calculateEarnings = () => 
    calculateEarningsUtil(calculateTimeWorked(), payRate, rateType);

  const getBreakDuration = () => 
    getBreakDurationUtil(totalBreakDuration, isBreakActive, breakStart);

  const handleConfirmShiftEnd = () => {
    shiftState.confirmShiftEnd(user?.id);
  };

  // Type-safe handler for rate type changes
  const handleRateTypeChange = (value: string) => {
    // Check if value is a valid rate type and cast it
    if (
      value === "Per Hour" ||
      value === "Per Day" ||
      value === "Per Week" ||
      value === "Per Month"
    ) {
      setRateType(value);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header Component */}
      <Header 
        language={language}
        setLanguage={setLanguage}
        handleSignOut={handleSignOut}
        setSheetOpen={setSheetOpen}
        sheetOpen={sheetOpen}
      />

      {/* Navigation Component */}
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
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
        </div>
      </main>

      {/* Dialogs and Alerts */}
      <StartShiftDialog 
        isOpen={isStartSignatureOpen}
        onOpenChange={setIsStartSignatureOpen}
        managerName={managerName}
        setManagerName={setManagerName}
        isSignatureEmpty={shiftState.isStartSignatureEmpty}
        setIsSignatureEmpty={setIsStartSignatureEmpty}
        confirmShiftStart={confirmShiftStart}
        employerName={employerName}
        setEmployerName={setEmployerName}
        payRate={payRate}
        setPayRate={setPayRate}
        rateType={rateType}
        setRateType={handleRateTypeChange}
        setStartSignatureData={setStartSignatureData}
      />

      <EndShiftDialog 
        isOpen={isEndSignatureOpen}
        onOpenChange={setIsEndSignatureOpen}
        endManagerName={endManagerName}
        setEndManagerName={setEndManagerName}
        isSignatureEmpty={shiftState.isEndSignatureEmpty}
        setIsSignatureEmpty={setIsEndSignatureEmpty}
        confirmShiftEnd={handleConfirmShiftEnd}
        startTime={startTime}
        formatDuration={formatDuration}
        calculateTimeWorked={calculateTimeWorked}
        getBreakDuration={getBreakDuration}
        setEndSignatureData={setEndSignatureData}
      />

      <ValidationAlert 
        showValidationAlert={showValidationAlert}
        setShowValidationAlert={setShowValidationAlert}
        validationType={validationType}
      />
    </div>
  );
};

export default DashboardPage;
