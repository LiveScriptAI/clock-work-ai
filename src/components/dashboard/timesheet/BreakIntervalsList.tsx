
import React from "react";
import { format } from "date-fns";

interface BreakIntervalsListProps {
  breakIntervals: { start: Date; end: Date }[];
}

const BreakIntervalsList: React.FC<BreakIntervalsListProps> = ({ breakIntervals }) => {
  if (!breakIntervals || breakIntervals.length === 0) {
    return null;
  }

  return (
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
  );
};

export default BreakIntervalsList;
