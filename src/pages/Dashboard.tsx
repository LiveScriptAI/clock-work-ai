// src/pages/Dashboard.tsx

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useShiftState } from "@/hooks/useShiftState";
import { useBreakTime } from "@/hooks/useBreakTime";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

// Import components
import Header from "@/components/dashboard/Header";
import TimeTracking from "@/components/dashboard/TimeTracking";
import DailySummary from "@/components/dashboard/DailySummary";
import TimesheetLog from "@/components/dashboard/TimesheetLog";
import InvoiceForm from "@/components/dashboard/invoice/InvoiceForm";
import CustomerTabs from "@/components/dashboard/CustomerTabs";
import StartShiftDialog from "@/components/dashboard/StartShiftDialog";
import EndShiftDialog from "@/components/dashboard/EndShiftDialog";
import ValidationAlert from "@/components/dashboard/ValidationAlert";

// Import utility functions
import {
  formatDuration,
  formatCountdown,
  calculateTimeWorked as calculateTimeWorkedUtil,
  calculateEarnings as calculateEarningsUtil,
  getBreakDuration as getBreakDurationUtil,
} from "@/components/dashboard/utils";

const BREAK_DURATIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
];

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, handleSignOut } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Shift state (but no break state here)
  const shiftState = useShiftState();
  const {
    isShiftActive,
    isStartSignatureOpen,
    isEndSignatureOpen,
    isShiftComplete,
    managerName,
    endManagerName,
    startTime,
    endTime,
    employerName,
    payRate,
    rateType,
    setManagerName,
    setEndManagerName,
    setIsStartSignatureEmpty,
    setIsEndSignatureEmpty,
    showValidationAlert,
    setShowValidationAlert,
    validationType,
    setIsStartSignatureOpen,
    setIsEndSignatureOpen,
    handleStartShift,
    handleEndShift,
    confirmShiftStart,
    setEmployerName,
    setPayRate,
    setRateType,
    setStartSignatureData,
    setEndSignatureData,
  } = shiftState;

  // Break state comes entirely from useBreakTime()
  const {
    isBreakActive: btActive,
    breakStart: btStart,
    totalBreakDuration: btTotal,
    remainingBreakTime,
    selectedBreakDuration,
    breakMenuOpen,
    setBreakMenuOpen,
    handleBreakToggle,
    handleBreakDurationChange,
  } = useBreakTime();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.href = "/login";
      }
    };
    checkAuth();
  }, []);

  // Wrappers using updated break total
  const calculateTimeWorked = () =>
    calculateTimeWorkedUtil(startTime, endTime, btTotal);

  const calculateEarnings = () =>
    calculateEarningsUtil(calculateTimeWorked(), payRate, rateType);

  const getBreakDuration = () =>
    getBreakDurationUtil(btTotal, btActive, btStart);

  const handleConfirmShiftEnd = () => {
    shiftState.confirmShiftEnd(user?.id);
  };

  // Rate type change
  const handleRateTypeChange = (value: string) => {
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
      {/* Header */}
      <Header
        handleSignOut={handleSignOut}
        setSheetOpen={setSheetOpen}
        sheetOpen={sheetOpen}
      />

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Time Tracking */}
          <TimeTracking
            startTime={startTime}
            endTime={endTime}
            isShiftActive={isShiftActive}
            isShiftComplete={isShiftComplete}
            isBreakActive={btActive}
            managerName={managerName}
            endManagerName={endManagerName}
            breakStart={btStart}
            totalBreakDuration={btTotal}
            remainingBreakTime={remainingBreakTime}
            selectedBreakDuration={selectedBreakDuration}
            breakMenuOpen={breakMenuOpen}
            handleBreakToggle={handleBreakToggle}
            handleBreakDurationChange={handleBreakDurationChange}
            setBreakMenuOpen={setBreakMenuOpen}
            formatCountdown={formatCountdown}
          />

          {/* Daily Summary */}
          <div className="grid grid-cols-1 mb-6">
            <DailySummary
              formatDuration={formatDuration}
              calculateTimeWorked={calculateTimeWorked}
              getBreakDuration={getBreakDuration}
              calculateEarnings={calculateEarnings}
              isShiftActive={isShiftActive}
              isShiftComplete={isShiftComplete}
              isBreakActive={btActive}
              employerName={employerName}
              rateType={rateType}
              payRate={payRate}
            />
          </div>

          {/* Timesheet Log */}
          <div className="mt-6">
            <TimesheetLog />
          </div>

          {/* Invoice Form */}
          <InvoiceForm />

          {/* Customer Tabs */}
          <div className="mt-6">
            <CustomerTabs />
          </div>
        </div>
      </main>

      {/* Dialogs & Alerts */}
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

