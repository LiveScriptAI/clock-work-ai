
// Since this is a read-only file, we'll need to create a wrapper component that adds the break intervals

import React from "react";
import { ShiftEntry } from "./types";
import { format } from "date-fns";

interface ShiftCardProps {
  shift: ShiftEntry;
  onDelete: (shiftId: string) => Promise<void>;
  breakIntervals?: { start: Date; end: Date }[];
}

const ShiftCardWrapper: React.FC<ShiftCardProps> = ({ 
  shift, 
  onDelete,
  breakIntervals = []
}) => {
  // We don't have access to the original ShiftCard, so we need to create our own simplified version
  return (
    <div className="p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{shift.employerName || "Unnamed Employer"}</h3>
          <p className="text-sm text-gray-500">
            {format(new Date(shift.startTime), "MMM d, yyyy • HH:mm")} - 
            {shift.endTime ? format(new Date(shift.endTime), " HH:mm") : " ongoing"}
          </p>
          
          {/* Display break intervals if there are any */}
          {breakIntervals && breakIntervals.length > 0 && (
            <div className="mt-2">
              <h4 className="text-xs font-medium text-gray-600">Breaks:</h4>
              <div className="text-xs text-gray-600">
                {breakIntervals.map((interval, idx) => (
                  <span key={idx} className="mr-2">
                    {format(interval.start, "HH:mm")}–{format(interval.end, "HH:mm")}
                    {idx < breakIntervals.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => onDelete(shift.id)}
          className="text-red-500 text-sm hover:text-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ShiftCardWrapper;
