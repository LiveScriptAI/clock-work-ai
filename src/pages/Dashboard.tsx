import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { differenceInSeconds } from "date-fns";

// Import components
import Header from "@/components/dashboard/Header";
import Navigation from "@/components/dashboard/Navigation";
import TimeTracking from "@/components/dashboard/TimeTracking";
import DailySummary from "@/components/dashboard/DailySummary";
import LocationMap from "@/components/dashboard/LocationMap";
import TimesheetLog from "@/components/dashboard/TimesheetLog";
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

const HOURLY_RATE = 15; // £15/hour placeholder rate
const BREAK_DURATIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [isStartSignatureOpen, setIsStartSignatureOpen] = useState(false);
  const [isEndSignatureOpen, setIsEndSignatureOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [language, setLanguage] = useState("english");
  const [managerName, setManagerName] = useState("");
  const [endManagerName, setEndManagerName] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [breakStart, setBreakStart] = useState<Date | null>(null);
  const [totalBreakDuration, setTotalBreakDuration] = useState(0); // in seconds
  const [isShiftComplete, setIsShiftComplete] = useState(false);
  
  // New form state variables
  const [employerName, setEmployerName] = useState("");
  const [payRate, setPayRate] = useState(HOURLY_RATE);
  const [rateType, setRateType] = useState("Per Hour");

  // Signature validation states
  const [isStartSignatureEmpty, setIsStartSignatureEmpty] = useState(true);
  const [isEndSignatureEmpty, setIsEndSignatureEmpty] = useState(true);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationType, setValidationType] = useState<'start' | 'end'>('start');
  
  // Break duration selector and countdown
  const [selectedBreakDuration, setSelectedBreakDuration] = useState("15"); // Default 15 minutes
  const [remainingBreakTime, setRemainingBreakTime] = useState(0); // in seconds
  const [breakMenuOpen, setBreakMenuOpen] = useState(false);

  // New states for signature data and user
  const [startSignatureData, setStartSignatureData] = useState<string | null>(null);
  const [endSignatureData, setEndSignatureData] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Check if user is authenticated
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Break countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isBreakActive && breakStart && remainingBreakTime > 0) {
      interval = setInterval(() => {
        setRemainingBreakTime((prev) => {
          if (prev <= 1) {
            // Break time is up
            handleBreakEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreakActive, breakStart, remainingBreakTime]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Navigation to login happens via the auth state change listener
  };

  const handleStartShift = () => {
    setIsStartSignatureOpen(true);
  };

  const handleEndShift = () => {
    setIsEndSignatureOpen(true);
  };

  const handleBreakStart = () => {
    const durationInMinutes = parseInt(selectedBreakDuration, 10);
    const durationInSeconds = durationInMinutes * 60;
    
    setBreakStart(new Date());
    setIsBreakActive(true);
    setRemainingBreakTime(durationInSeconds);
    
    toast.info(`Break started for ${durationInMinutes} minutes`);
  };

  const handleBreakEnd = () => {
    if (breakStart) {
      const breakDuration = differenceInSeconds(new Date(), breakStart);
      setTotalBreakDuration(prev => prev + breakDuration);
    }
    
    setBreakStart(null);
    setIsBreakActive(false);
    setRemainingBreakTime(0);
    
    toast.success("Break ended");
  };

  const handleBreakToggle = () => {
    if (isBreakActive) {
      handleBreakEnd();
    } else {
      handleBreakStart();
    }
  };

  const handleBreakDurationChange = (duration: string) => {
    setSelectedBreakDuration(duration);
    setBreakMenuOpen(false);
  };

  const confirmShiftStart = () => {
    if (isStartSignatureEmpty || !managerName.trim() || !employerName.trim()) {
      setValidationType('start');
      setShowValidationAlert(true);
      return;
    }
    
    setIsStartSignatureOpen(false);
    setIsShiftActive(true);
    setStartTime(new Date());
    setIsShiftComplete(false);
    // Reset any previous shift data
    setEndTime(null);
    setTotalBreakDuration(0);
    setBreakStart(null);
    setIsBreakActive(false);
    toast.success("Shift started successfully!");
  };

  const confirmShiftEnd = async () => {
    if (isEndSignatureEmpty || !endManagerName.trim()) {
      setValidationType('end');
      setShowValidationAlert(true);
      return;
    }
    
    // If still on break, end it and add to total
    if (isBreakActive && breakStart) {
      const breakDuration = differenceInSeconds(new Date(), breakStart);
      setTotalBreakDuration(prev => prev + breakDuration);
      setBreakStart(null);
      setIsBreakActive(false);
    }
    
    const currentEndTime = new Date();
    setEndTime(currentEndTime);
    
    // Save to Supabase
    if (startTime && user) {
      try {
        const { error } = await supabase
          .from('shifts')
          .insert([
            {
              user_id: user.id,
              start_time: startTime.toISOString(),
              end_time: currentEndTime.toISOString(),
              break_duration: totalBreakDuration,
              employer_name: employerName,
              pay_rate: payRate,
              rate_type: rateType,
              manager_start_name: managerName,
              manager_end_name: endManagerName,
              manager_start_signature: startSignatureData,
              manager_end_signature: endSignatureData
            }
          ]);
        
        if (error) {
          console.error('Error saving shift:', error);
          toast.error("Failed to save shift data. Please try again.");
        } else {
          toast.success("Shift ended and data saved successfully!");
        }
      } catch (error) {
        console.error('Exception when saving shift:', error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
    
    setIsEndSignatureOpen(false);
    setIsShiftActive(false);
    setIsShiftComplete(true);
  };

  // Utility wrapper functions that use component state
  const calculateTimeWorked = () => 
    calculateTimeWorkedUtil(startTime, endTime, totalBreakDuration);

  const calculateEarnings = () => 
    calculateEarningsUtil(calculateTimeWorked(), payRate, rateType);

  const getBreakDuration = () => 
    getBreakDurationUtil(totalBreakDuration, isBreakActive, breakStart);

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
            remainingBreakTime={remainingBreakTime}
            selectedBreakDuration={selectedBreakDuration}
            breakMenuOpen={breakMenuOpen}
            BREAK_DURATIONS={BREAK_DURATIONS}
            handleStartShift={handleStartShift}
            handleEndShift={handleEndShift}
            handleBreakToggle={handleBreakToggle}
            handleBreakDurationChange={handleBreakDurationChange}
            setBreakMenuOpen={setBreakMenuOpen}
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
        </div>
      </main>

      {/* Dialogs and Alerts */}
      <StartShiftDialog 
        isOpen={isStartSignatureOpen}
        onOpenChange={setIsStartSignatureOpen}
        managerName={managerName}
        setManagerName={setManagerName}
        isSignatureEmpty={isStartSignatureEmpty}
        setIsSignatureEmpty={setIsStartSignatureEmpty}
        confirmShiftStart={confirmShiftStart}
        employerName={employerName}
        setEmployerName={setEmployerName}
        payRate={payRate}
        setPayRate={setPayRate}
        rateType={rateType}
        setRateType={setRateType}
        setStartSignatureData={setStartSignatureData}
      />

      <EndShiftDialog 
        isOpen={isEndSignatureOpen}
        onOpenChange={setIsEndSignatureOpen}
        endManagerName={endManagerName}
        setEndManagerName={setEndManagerName}
        isSignatureEmpty={isEndSignatureEmpty}
        setIsSignatureEmpty={setIsEndSignatureEmpty}
        confirmShiftEnd={confirmShiftEnd}
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
