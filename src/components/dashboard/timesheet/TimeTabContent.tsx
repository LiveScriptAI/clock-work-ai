
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
}

const TimeTabContent: React.FC<TimeTabContentProps> = ({
  period,
  activeTab,
  filteredShifts,
  isLoading,
  isDateRangeActive,
  error,
  onDeleteShift
}) => {
  return (
    <TabsContent key={period} value={period}>
      <ShiftsList
        shifts={filteredShifts}
        isLoading={isLoading}
        isDateRangeActive={isDateRangeActive}
        error={error}
        onDeleteShift={onDeleteShift}
      />
    </TabsContent>
  );
};

export default TimeTabContent;
