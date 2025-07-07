// src/components/dashboard/TimeTracking.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
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
  handleEndShift
}) => {
  return <Card className="w-full bg-slate-50 rounded-2xl mx-0 px-0 py-0 my-[6px]">
      <CardHeader className="p-4">
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <Clock className="h-5 w-5" />
          Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {startTime && <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
            <p className="text-sm text-green-800">
              <span className="font-medium">Clocked in at:</span>{" "}
              {format(startTime, "h:mm a 'on' MMMM d, yyyy")}
            </p>
            <p className="text-sm text-green-800 mt-1">
              <span className="font-medium">Manager:</span> {managerName}
            </p>

            {isShiftComplete && endTime && <div className="mt-2 pt-2 border-t border-green-200">
                <p className="text-sm text-red-600">
                  <span className="font-medium">Clocked out at:</span>{" "}
                  {format(endTime, "h:mm a")}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  <span className="font-medium">Approved by:</span>{" "}
                  {endManagerName}
                </p>
              </div>}
          </div>}

        <div className="space-y-4">
          <Button size="lg" className="w-full my-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:hover:bg-gray-500" onClick={handleStartShift} disabled={isShiftActive || isShiftComplete}>
            {isShiftActive ? "Shift Started" : "Start Shift"}
          </Button>

          <Button size="lg" className="w-full my-4 bg-red-600 hover:bg-red-700" onClick={handleEndShift} disabled={!isShiftActive || isShiftComplete}>
            End Shift
          </Button>
        </div>
      </CardContent>
    </Card>;
};
export default TimeTracking;