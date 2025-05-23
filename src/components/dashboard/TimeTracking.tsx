
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock, Check, Timer } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslation } from "react-i18next";

type BreakDuration = {
  value: string;
  label: string;
};

type TimeTrackingProps = {
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
  BREAK_DURATIONS?: BreakDuration[];
  handleStartShift: () => void;
  handleEndShift: () => void;
  handleBreakToggle: () => void;
  handleBreakDurationChange: (duration: string) => void;
  setBreakMenuOpen: (open: boolean) => void;
  formatCountdown: (seconds: number) => string;
  getBreakDuration?: () => string;
};

const BREAK_DURATIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
];

const TimeTracking: React.FC<TimeTrackingProps> = ({
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
  BREAK_DURATIONS: customBreakDurations,
  handleStartShift,
  handleEndShift,
  handleBreakToggle,
  handleBreakDurationChange,
  setBreakMenuOpen,
  formatCountdown,
}) => {
  const { t } = useTranslation();
  const breakDurations = customBreakDurations || BREAK_DURATIONS;
  
  // Determine if break has exceeded duration
  const isBreakOvertime = remainingBreakTime < 0;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          {t('Time Tracking')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {startTime && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <span className="font-medium">{t('Clocked in at')}:</span> {format(startTime, "h:mm a 'on' MMMM d, yyyy")}
            </p>
            <p className="text-sm text-green-800 mt-1">
              <span className="font-medium">{t('Manager')}:</span> {managerName}
            </p>
            
            {isBreakActive && breakStart && (
              <div className="mt-2 pt-2 border-t border-green-200">
                <p className={`text-sm ${isBreakOvertime ? 'text-red-600' : 'text-amber-600'} font-medium flex items-center`}>
                  <Timer className="h-4 w-4 mr-1" />
                  {t('On break')}: 
                  {isBreakOvertime ? (
                    <span className="ml-1 font-bold text-red-600">
                      {formatCountdown(Math.abs(remainingBreakTime))} {t('overtime')}
                    </span>
                  ) : (
                    <span className="ml-1 font-bold">
                      {formatCountdown(remainingBreakTime)} {t('remaining')}
                    </span>
                  )}
                </p>
              </div>
            )}
            
            {isShiftComplete && endTime && (
              <div className="mt-2 pt-2 border-t border-green-200">
                <p className="text-sm text-red-600">
                  <span className="font-medium">{t('Clocked out at')}:</span> {format(endTime, "h:mm a")}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  <span className="font-medium">{t('Approved by')}:</span> {endManagerName}
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            size="lg" 
            className={`${isShiftActive ? 'bg-gray-400 hover:bg-gray-500' : 'bg-green-600 hover:bg-green-700'}`} 
            onClick={handleStartShift}
            disabled={isShiftActive || isShiftComplete}
          >
            {isShiftActive ? t('Shift Started') : t('Start Shift')}
          </Button>
          
          <div className="relative">
            <div className="flex space-x-2">
              <Popover open={breakMenuOpen} onOpenChange={setBreakMenuOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="px-2"
                    disabled={!isShiftActive || isShiftComplete || isBreakActive}
                  >
                    <Timer className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium px-2 py-1 text-gray-500">{t('Break duration')}:</p>
                    {breakDurations.map((duration) => (
                      <Button
                        key={duration.value}
                        variant="ghost"
                        className="justify-start"
                        onClick={() => handleBreakDurationChange(duration.value)}
                      >
                        {duration.label}
                        {selectedBreakDuration === duration.value && (
                          <Check className="h-4 w-4 ml-2 text-green-500" />
                        )}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button 
                size="lg" 
                className={`${isBreakActive ? (isBreakOvertime ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700') : 'bg-blue-600 hover:bg-blue-700'} flex-1`} 
                onClick={handleBreakToggle}
                disabled={!isShiftActive || isShiftComplete}
              >
                {isBreakActive ? t('End Break') : `${t('Start')} ${selectedBreakDuration} ${t('min Break')}`}
              </Button>
            </div>
          </div>
          
          <Button 
            size="lg" 
            className="bg-red-600 hover:bg-red-700" 
            onClick={handleEndShift}
            disabled={!isShiftActive || isShiftComplete}
          >
            {t('End Shift')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTracking;
