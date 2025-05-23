
import React from "react";
import { ShiftEntry } from "./types";
import { format } from "date-fns";

interface ShiftCardProps {
  shift: ShiftEntry;
  onDelete: (shiftId: string) => Promise<void>;
  breakIntervals?: { start: Date; end: Date }[];
}

const ShiftCard: React.FC<ShiftCardProps> = ({ 
  shift, 
  onDelete,
  breakIntervals = []
}) => {
  return (
    <div className="p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium">{shift.employer || "Unnamed Employer"}</h3>
          <p className="text-sm text-gray-500">
            {format(new Date(shift.startTime), "MMM d, yyyy • HH:mm")} - 
            {shift.endTime ? format(new Date(shift.endTime), " HH:mm") : " ongoing"}
          </p>
          
          {/* Display break intervals if there are any */}
          {breakIntervals && breakIntervals.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              <strong>Breaks:</strong>
              <ul className="list-disc list-inside ml-2">
                {breakIntervals.map((interval, idx) => (
                  <li key={idx}>
                    {format(interval.start, "HH:mm")} – {format(interval.end, "HH:mm")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          <button className="text-blue-500 text-sm hover:text-blue-700">
            Add to Invoice
          </button>
          <button 
            onClick={() => onDelete(shift.id)}
            className="text-red-500 text-sm hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftCard;
