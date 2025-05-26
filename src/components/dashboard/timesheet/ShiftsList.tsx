
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertCircle } from "lucide-react";
import ShiftCard from "./ShiftCard";
import EmptyState from "./EmptyState";
import { ShiftEntry } from "./types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ShiftsListProps {
  shifts: ShiftEntry[];
  isLoading: boolean;
  isDateRangeActive: boolean;
  error: string | null;
  onDeleteShift: (shiftId: string) => Promise<void>;
}

const ShiftsList: React.FC<ShiftsListProps> = ({ 
  shifts, 
  isLoading, 
  isDateRangeActive,
  error,
  onDeleteShift
}) => {
  console.log("ShiftsList - rendering with:", {
    shiftsCount: shifts.length,
    isLoading,
    isDateRangeActive,
    error,
    shifts: shifts.map(s => ({ id: s.id, date: s.date, employer: s.employer }))
  });

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
            <ShiftCard 
              key={shift.id} 
              shift={shift} 
              onDelete={onDeleteShift}
            />
          ))}
        </div>
      ) : (
        <EmptyState isDateRangeActive={isDateRangeActive} />
      )}
    </ScrollArea>
  );
};

export default ShiftsList;
