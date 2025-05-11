
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import ShiftCard from "./ShiftCard";
import EmptyState from "./EmptyState";
import { ShiftEntry } from "./types";

interface ShiftsListProps {
  shifts: ShiftEntry[];
  isLoading: boolean;
  isDateRangeActive: boolean;
}

const ShiftsList: React.FC<ShiftsListProps> = ({ 
  shifts, 
  isLoading, 
  isDateRangeActive 
}) => {
  return (
    <ScrollArea className="h-[320px] w-full pr-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : shifts.length > 0 ? (
        <div className="space-y-4">
          {shifts.map((shift) => (
            <ShiftCard key={shift.id} shift={shift} />
          ))}
        </div>
      ) : (
        <EmptyState isDateRangeActive={isDateRangeActive} />
      )}
    </ScrollArea>
  );
};

export default ShiftsList;
