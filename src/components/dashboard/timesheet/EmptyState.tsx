
import React from "react";
import { Clock, Calendar } from "lucide-react";

interface EmptyStateProps {
  isDateRangeActive: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ isDateRangeActive }) => {
  return (
    <div className="flex flex-col justify-center items-center h-full text-center py-8 space-y-3">
      <div className="text-muted-foreground/60">
        {isDateRangeActive ? (
          <Calendar className="w-12 h-12" />
        ) : (
          <Clock className="w-12 h-12" />
        )}
      </div>
      <div>
        <p className="text-muted-foreground font-medium">
          {isDateRangeActive ? "No shifts found" : "No entries yet"}
        </p>
        <p className="text-sm text-muted-foreground/80 mt-1">
          {isDateRangeActive 
            ? "Try adjusting your date range" 
            : "Start by adding your first shift"}
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
