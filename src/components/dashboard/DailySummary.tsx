import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDistanceStrict, differenceInSeconds } from "date-fns";

interface DailySummaryProps {
  employerName: string;
  startTime: Date | null;
  endTime: Date | null;
  isShiftActive: boolean;
  isShiftComplete: boolean;
  payRate: number;
  rateType: string;
  formatDuration: (seconds: number) => string;
  calculateTimeWorked: () => number;
  calculateEarnings: () => string;
}

const DailySummary: React.FC<DailySummaryProps> = ({
  employerName,
  startTime,
  endTime,
  isShiftActive,
  isShiftComplete,
  payRate,
  rateType,
  formatDuration,
  calculateTimeWorked,
  calculateEarnings,
}) => {
  // If shift hasn't started yet, show nothing (or you could choose to hide the card entirely)
  if (!startTime) {
    return null;
  }

  // Calculate worked seconds so far (or final if ended)
  const workedSeconds = calculateTimeWorked();

  return (
    <Card className="w-full bg-white rounded-2xl">
      <CardHeader className="p-4">
        <CardTitle className="text-2xl font-bold text-center">Daily Summary</CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Employer:</p>
            <p>{employerName}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Hours Worked:</p>
            <p>{formatDuration(workedSeconds)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Estimated Earnings:</p>
            <p>
              {calculateEarnings()}{" "}
              <span className="text-xs text-muted-foreground">
                (Per {rateType})
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
