
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format, formatDistanceStrict, differenceInSeconds } from "date-fns";
import { useTranslation } from "react-i18next";
import { useBreakTime } from "@/hooks/useBreakTime";

type TimeTrackingProps = {
  startTime: Date | null;
  endTime: Date | null;
  isShiftActive: boolean;
  isShiftComplete: boolean;
  managerName: string;
  endManagerName: string;
  handleStartShift: () => void;
  handleEndShift: () => void;
};

const TimeTracking: React.FC<TimeTrackingProps> = ({
  startTime,
  endTime,
  isShiftActive,
  isShiftComplete,
  managerName,
  endManagerName,
  handleStartShift,
  handleEndShift,
}) => {
  const { t } = useTranslation();
  
  const {
    handleBreakToggle,
    isBreakActive,
    breakIntervals,
  } = useBreakTime();

  // Helper function to format duration in HH:mm:ss
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="mb-6 border-brand-accent/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center font-display text-brand-navy">
          <Clock className="mr-2 h-5 w-5 text-brand-accent" />
          {t('Time Tracking')}
        </CardTitle>
      </CardHeader>
      <CardContent className="font-body">
        {startTime && (
          <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-brand-accent/10 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <span className="font-medium">{t('Clocked in at')}:</span> {format(startTime, "h:mm a 'on' MMMM d, yyyy")}
            </p>
            <p className="text-sm text-green-800 mt-1">
              <span className="font-medium">{t('Manager')}:</span> {managerName}
            </p>
            
            {/* Break intervals display */}
            {breakIntervals.length > 0 && (
              <div className="mt-2 pt-2 border-t border-green-200">
                <div className="text-sm text-brand-navy font-medium mb-2">Break Intervals:</div>
                {breakIntervals.map((interval, index) => (
                  <div key={interval.start.toISOString()} className="text-sm text-brand-navy mb-1">
                    <div>Break started: {format(interval.start, 'HH:mm:ss')}</div>
                    <div>Break ended: {interval.end ? format(interval.end, 'HH:mm:ss') : '…'}</div>
                    <div>Duration: {formatDuration(differenceInSeconds(interval.end ?? new Date(), interval.start))}</div>
                    {index < breakIntervals.length - 1 && <div className="border-b border-blue-200 my-1"></div>}
                  </div>
                ))}
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
            className={`font-body ${isShiftActive ? 'bg-gray-400 hover:bg-gray-500' : 'bg-gradient-to-r from-brand-primaryStart to-brand-primaryEnd hover:opacity-90 text-white'}`} 
            onClick={handleStartShift}
            disabled={isShiftActive || isShiftComplete}
          >
            {isShiftActive ? t('Shift Started') : t('Start Shift')}
          </Button>
          
          <Button
            variant="default"
            size="lg"
            onClick={handleBreakToggle}
            disabled={!isShiftActive || isShiftComplete}
            className="px-8 bg-brand-navy hover:bg-brand-navy/90 text-white font-body"
          >
            {isBreakActive ? t('End Break') : t('Start Break')}
          </Button>
          
          <Button 
            size="lg" 
            className="bg-red-600 hover:bg-red-700 text-white font-body" 
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
