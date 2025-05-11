
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

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
}) => {
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
            <span className="font-medium">{formatDuration(calculateTimeWorked())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Break Duration:</span>
            <span className="font-medium">{getBreakDuration()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Earnings:</span>
            <span className="font-medium">
              £{calculateEarnings()}
              <span className="text-xs text-gray-500 ml-1">({rateType})</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shift Status:</span>
            <span className={`font-medium ${isShiftActive ? 'text-green-600' : isShiftComplete ? 'text-red-600' : 'text-gray-600'}`}>
              {isShiftActive ? (isBreakActive ? 'On Break' : 'Active') : isShiftComplete ? 'Completed' : 'Not Started'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySummary;
