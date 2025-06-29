
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { calculateEarnings, formatHours, formatEarnings } from "@/utils/earningsCalculator";

interface DailySummaryProps {
  employerName: string;
  startTime: Date | null;
  endTime: Date | null;
  isShiftActive: boolean;
  isShiftComplete: boolean;
  payRate: number;
  rateType: string;
  totalBreakDuration: number;
}

const DailySummary: React.FC<DailySummaryProps> = ({
  employerName,
  startTime,
  endTime,
  isShiftActive,
  isShiftComplete,
  payRate,
  rateType,
  totalBreakDuration = 0,
}) => {
  // If shift hasn't started yet, show nothing
  if (!startTime) {
    return null;
  }

  // Calculate worked time and earnings using the unified utility
  const currentEndTime = endTime || new Date();
  const { hoursWorked, earnings } = calculateEarnings(
    startTime,
    currentEndTime,
    totalBreakDuration,
    payRate
  );

  return (
    <Card className="mb-6 bg-white rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Daily Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Employer:</p>
            <p>{employerName}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Hours Worked:</p>
            <p>{formatHours(hoursWorked)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Estimated Earnings:</p>
            <p>
              {formatEarnings(earnings)}{" "}
              <span className="text-xs text-muted-foreground">
                ({rateType})
              </span>
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Shift Status:</p>
            <p className={isShiftComplete ? "text-gray-500" : "text-green-600"}>
              {isShiftComplete ? "Completed" : isShiftActive ? "Active" : "Not started"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySummary;
