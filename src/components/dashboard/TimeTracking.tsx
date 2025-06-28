import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { format, differenceInSeconds } from "date-fns";

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
  // Compute net worked seconds (no breaks)
  const workedSeconds = startTime && endTime
    ? differenceInSeconds(endTime, startTime)
    : 0;

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <Card className="mb-6 bg-slate-50 rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          <Clock className="mr-2 h-5 w-5" />
          Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        {startTime && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <span className="font-medium">Clocked in at:</span>{" "}
              {format(startTime, "h:mm a 'on' MMMM d, yyyy")}
            </p>
            <p className="text-sm text-green-800 mt-1">
              <span className="font-medium">Manager:</span> {managerName}
            </p>

            {isShiftComplete && endTime && (
              <div className="mt-2 pt-2 border-t border-green-200">
                <p className="text-sm text-red-600">
                  <span className="font-medium">Clocked out at:</span>{" "}
                  {format(endTime, "h:mm a")}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  <span className="font-medium">Approved by:</span>{" "}
                  {endManagerName}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  <span className="font-medium">Total time:</span>{" "}
                  {formatDuration(workedSeconds)}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleStartShift}
            disabled={isShiftActive || isShiftComplete}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            {isShiftActive ? "Shift Started" : "Start Shift"}
          </button>

          {/* Break buttons removed */}

          <button
            onClick={handleEndShift}
            disabled={!isShiftActive || isShiftComplete}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            End Shift
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTracking;
