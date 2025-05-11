
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type DailySummaryProps = {
  formatDuration: (seconds: number) => string;
  calculateTimeWorked: () => number;
  getBreakDuration: () => string;
  calculateEarnings: () => string;
  isShiftActive: boolean;
  isShiftComplete: boolean;
  isBreakActive: boolean;
};

const DailySummary: React.FC<DailySummaryProps> = ({
  formatDuration,
  calculateTimeWorked,
  getBreakDuration,
  calculateEarnings,
  isShiftActive,
  isShiftComplete,
  isBreakActive,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
            <span className="font-medium">£{calculateEarnings()}</span>
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
