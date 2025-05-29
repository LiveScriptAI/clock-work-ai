
import React from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteBreakIntervalsForShift } from "@/services/breakIntervalsService";
import { exportBreaksToCSV, exportBreaksToPDF } from "@/components/dashboard/timesheet/export-utils";

interface BreakInterval {
  start: string;
  end: string;
}

interface BreaksSummaryProps {
  breakIntervalsByShift: Record<string, BreakInterval[]>;
  onBreakDeleted?: () => void;
}

const formatShiftDisplay = (shiftId: string): string => {
  // Check if shiftId is in date format (YYYY-MM-DD)
  if (shiftId.match(/^\d{4}-\d{2}-\d{2}$/)) {
    try {
      const date = parseISO(shiftId);
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error("Error formatting date:", error);
      return shiftId;
    }
  }
  
  // For legacy timestamp-based IDs, try to extract date
  if (shiftId.startsWith('current_shift_') || shiftId.startsWith('test_shift_')) {
    const timestamp = shiftId.split('_').pop();
    if (timestamp && !isNaN(Number(timestamp))) {
      try {
        const date = new Date(Number(timestamp));
        return format(date, 'MMMM d, yyyy');
      } catch (error) {
        console.error("Error formatting timestamp:", error);
        return shiftId;
      }
    }
  }
  
  return shiftId;
};

const BreaksSummary: React.FC<BreaksSummaryProps> = ({ breakIntervalsByShift, onBreakDeleted }) => {
  const hasBreaks = Object.keys(breakIntervalsByShift).length > 0;

  const handleDeleteBreak = async (shiftId: string) => {
    try {
      const success = await deleteBreakIntervalsForShift(shiftId);
      
      if (success) {
        toast.success("Break deleted successfully");
        onBreakDeleted?.();
      } else {
        toast.error("Failed to delete break");
      }
    } catch (error) {
      console.error("Error deleting break:", error);
      toast.error("An error occurred while deleting the break");
    }
  };

  const handleExportBreaks = async (shiftId: string, intervals: BreakInterval[], format: 'csv' | 'pdf') => {
    try {
      const breakData = { [shiftId]: intervals };
      
      if (format === 'csv') {
        await exportBreaksToCSV(breakData);
        toast.success("Break data exported to CSV");
      } else {
        await exportBreaksToPDF(breakData);
        toast.success("Break data exported to PDF");
      }
    } catch (error) {
      console.error("Error exporting break data:", error);
      toast.error("Failed to export break data");
    }
  };

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
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{formatShiftDisplay(shiftId)}</h4>
                  <Badge variant="outline">{intervals.length} break{intervals.length !== 1 ? 's' : ''}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportBreaks(shiftId, intervals, 'csv')}
                    className="text-xs"
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportBreaks(shiftId, intervals, 'pdf')}
                    className="text-xs"
                  >
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBreak(shiftId)}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
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
