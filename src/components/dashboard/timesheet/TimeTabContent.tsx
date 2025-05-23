
// Since this is a read-only file, we'll need to create a wrapper component that adds the break intervals

import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import ShiftsList from "./ShiftsList";
import { ShiftEntry } from "./types";

interface TimeTabContentProps {
  period: string;
  activeTab: string;
  filteredShifts: ShiftEntry[];
  isLoading: boolean;
  isDateRangeActive: boolean;
  error: string | null;
  onDeleteShift: (shiftId: string) => Promise<void>;
  breakIntervals?: { start: Date; end: Date }[];
}

const TimeTabContentWrapper: React.FC<TimeTabContentProps> = ({
  period,
  activeTab,
  filteredShifts,
  isLoading,
  isDateRangeActive,
  error,
  onDeleteShift,
  breakIntervals = []
}) => {
  return (
    <TabsContent value={period} className="mt-0">
      <ShiftsList
        shifts={filteredShifts}
        isLoading={isLoading}
        isDateRangeActive={isDateRangeActive}
        error={error}
        onDeleteShift={onDeleteShift}
        breakIntervals={breakIntervals}
      />
    </TabsContent>
  );
};

export default TimeTabContentWrapper;
