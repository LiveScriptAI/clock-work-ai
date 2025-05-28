
import React from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BreakInterval {
  start: string;
  end: string;
}

interface BreaksSummaryProps {
  breakIntervalsByShift: Record<string, BreakInterval[]>;
}

const BreaksSummary: React.FC<BreaksSummaryProps> = ({ breakIntervalsByShift }) => {
  const hasBreaks = Object.keys(breakIntervalsByShift).length > 0;

  if (!hasBreaks) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Breaks Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No breaks recorded for any shifts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Breaks Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(breakIntervalsByShift).map(([shiftId, intervals]) => (
          <Card key={shiftId} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-medium">Shift ID: {shiftId}</h4>
                <Badge variant="outline">{intervals.length} break{intervals.length !== 1 ? 's' : ''}</Badge>
              </div>
              <div className="grid gap-2">
                {intervals.map((interval, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Break {index + 1}:</span>
                    <span className="font-mono">
                      {format(parseISO(interval.start), 'HH:mm')} – {format(parseISO(interval.end), 'HH:mm')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default BreaksSummary;
