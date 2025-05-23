
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { format } from "date-fns";

type DailySummaryProps = {
  formatDuration: (seconds: number) => string;
  calculateTimeWorked: () => number;
  getBreakDuration: () => string;
  calculateEarnings: () => string;
  isShiftActive: boolean;
  isShiftComplete: boolean;
  isBreakActive: boolean;
  employerName?: string;
  rateType?: string;
  payRate?: number;
  breakIntervals?: { start: Date; end: Date | null }[];
};

const DailySummary: React.FC<DailySummaryProps> = ({
  formatDuration,
  calculateTimeWorked,
  getBreakDuration,
  calculateEarnings,
  isShiftActive,
  isShiftComplete,
  isBreakActive,
  employerName = "",
  rateType = "Per Hour",
  payRate = 15,
  breakIntervals = [],
}) => {
  // State to store and refresh values
  const [timeWorked, setTimeWorked] = useState(calculateTimeWorked());
  const [earnings, setEarnings] = useState(calculateEarnings());
  
  // Update values every second to ensure they're always accurate
  useEffect(() => {
    // Initial update
    setTimeWorked(calculateTimeWorked());
    setEarnings(calculateEarnings());
    
    // Set interval to update values if shift is active
    const intervalId = setInterval(() => {
      if (isShiftActive || isBreakActive) {
        setTimeWorked(calculateTimeWorked());
        setEarnings(calculateEarnings());
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [isShiftActive, isBreakActive, calculateTimeWorked, calculateEarnings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(isShiftActive || isShiftComplete) && employerName && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center">
                <User className="h-4 w-4 mr-1" />
                Employer:
              </span>
              <span className="font-medium">{employerName}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">Hours Worked:</span>
            <span className="font-medium">{formatDuration(timeWorked)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Earnings:</span>
            <span className="font-medium">
              £{earnings}
              <span className="text-xs text-gray-500 ml-1">({rateType})</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shift Status:</span>
            <span className={`font-medium ${isShiftActive ? 'text-green-600' : isShiftComplete ? 'text-red-600' : 'text-gray-600'}`}>
              {isShiftActive ? (isBreakActive ? 'On Break' : 'Active') : isShiftComplete ? 'Completed' : 'Not Started'}
            </span>
          </div>
          
          {(isShiftActive || isShiftComplete) && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Breaks</h4>
              {breakIntervals && breakIntervals.length > 0 ? (
                <div className="space-y-1">
                  {breakIntervals.map((interval, i) => (
                    <p key={i} className="text-sm text-gray-700">
                      {format(interval.start, 'hh:mm a')} –{' '}
                      {interval.end ? format(interval.end, 'hh:mm a') : '…'}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-gray-500">No breaks</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySummary;
