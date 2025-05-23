
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertCircle } from "lucide-react";
import ShiftCardWrapper from "./ShiftCard"; // Using our wrapper instead
import EmptyState from "./EmptyState";
import { ShiftEntry } from "./types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

interface ShiftsListProps {
  shifts: ShiftEntry[];
  isLoading: boolean;
  isDateRangeActive: boolean;
  error: string | null;
  onDeleteShift: (shiftId: string) => Promise<void>;
  breakIntervals?: { start: Date; end: Date }[];
}

const ShiftsList: React.FC<ShiftsListProps> = ({ 
  shifts, 
  isLoading, 
  isDateRangeActive,
  error,
  onDeleteShift,
  breakIntervals = []
}) => {
  return (
    <ScrollArea className="h-[320px] w-full pr-4">
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : shifts.length > 0 ? (
        <div className="space-y-4">
          {shifts.map((shift) => (
            <ShiftCardWrapper 
              key={shift.id} 
              shift={shift} 
              onDelete={onDeleteShift}
              breakIntervals={breakIntervals}
            />
          ))}

          {/* Display break intervals if there are any */}
          {breakIntervals && breakIntervals.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg border mt-4">
              <h3 className="text-sm font-medium mb-2">Today's Breaks</h3>
              <ul className="space-y-1">
                {breakIntervals.map((interval, idx) => (
                  <li key={idx} className="text-sm text-gray-600">
                    {format(interval.start, "HH:mm")} – {format(interval.end, "HH:mm")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <EmptyState isDateRangeActive={isDateRangeActive} />
      )}
    </ScrollArea>
  );
};

export default ShiftsList;
