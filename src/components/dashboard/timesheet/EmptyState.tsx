
import React from "react";

interface EmptyStateProps {
  isDateRangeActive: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ isDateRangeActive }) => {
  return (
    <div className="flex justify-center items-center h-full text-muted-foreground">
      {isDateRangeActive
        ? "No shifts found for selected dates."
        : "No timesheet entries found."}
    </div>
  );
};

export default EmptyState;
