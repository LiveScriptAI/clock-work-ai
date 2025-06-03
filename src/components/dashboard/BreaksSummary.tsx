import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteBreakIntervalsForShift, getBreakIntervalsByShift } from "@/services/breakIntervalsService";
import { exportBreaksToCSV, exportBreaksToPDF } from "@/components/dashboard/timesheet/export-utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface BreakInterval {
  start: string;
  end: string;
}

interface BreaksSummaryProps {
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

const BreaksSummary: React.FC<BreaksSummaryProps> = ({ onBreakDeleted }) => {
  const isMobile = useIsMobile();
  const [breakIntervalsByShift, setBreakIntervalsByShift] = useState<Record<string, BreakInterval[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch break data from Supabase
  const fetchBreakData = async () => {
    setIsLoading(true);
    try {
      console.log("BreaksSummary - Fetching break data...");
      const data = await getBreakIntervalsByShift();
      console.log("BreaksSummary - Received break data:", data);
      
      // Remove duplicate entries by ensuring unique shift IDs
      const uniqueData: Record<string, BreakInterval[]> = {};
      Object.entries(data).forEach(([shiftId, intervals]) => {
        // Only keep the first occurrence of each shift ID to prevent duplicates
        if (!uniqueData[shiftId]) {
          uniqueData[shiftId] = intervals;
        }
      });
      
      setBreakIntervalsByShift(uniqueData);
    } catch (error) {
      console.error("BreaksSummary - Error fetching break data:", error);
      toast.error("Failed to load break data");
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchBreakData();
  }, []);

  const hasBreaks = Object.keys(breakIntervalsByShift).length > 0;

  const handleDeleteBreak = async (targetShiftId: string) => {
    console.log("BreaksSummary - Attempting to delete break for shift:", targetShiftId);
    
    try {
      const success = await deleteBreakIntervalsForShift(targetShiftId);
      
      if (success) {
        console.log("BreaksSummary - Successfully deleted break for shift:", targetShiftId);
        toast.success("Break deleted successfully");
        
        // Refresh the data
        await fetchBreakData();
        onBreakDeleted?.();
      } else {
        console.error("BreaksSummary - Failed to delete break for shift:", targetShiftId);
        toast.error("Failed to delete break");
      }
    } catch (error) {
      console.error("BreaksSummary - Error deleting break:", error);
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Breaks Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading break data...</span>
        </CardContent>
      </Card>
    );
  }

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

  // Sort entries by shift ID to ensure consistent ordering (most recent first)
  const sortedEntries = Object.entries(breakIntervalsByShift).sort(([a], [b]) => {
    // Sort by timestamp if available, otherwise alphabetically
    const aTime = a.startsWith('current_shift_') ? parseInt(a.split('_').pop() || '0') : 0;
    const bTime = b.startsWith('current_shift_') ? parseInt(b.split('_').pop() || '0') : 0;
    return bTime - aTime; // Most recent first
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Breaks Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedEntries.map(([shiftId, intervals]) => (
          <Card key={shiftId} className="border border-gray-200">
            <CardContent className="p-3 sm:p-4">
              <div className={`flex items-start justify-between mb-3 ${isMobile ? 'flex-col space-y-2' : 'flex-row'}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-sm sm:text-base">{formatShiftDisplay(shiftId)}</h4>
                  <Badge variant="outline" className="text-xs">
                    {intervals.length} break{intervals.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className={`flex gap-1 sm:gap-2 ${isMobile ? 'w-full flex-wrap' : ''}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportBreaks(shiftId, intervals, 'csv')}
                    className={`text-xs px-2 py-1 ${isMobile ? 'flex-1' : ''}`}
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportBreaks(shiftId, intervals, 'pdf')}
                    className={`text-xs px-2 py-1 ${isMobile ? 'flex-1' : ''}`}
                  >
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBreak(shiftId)}
                    className={`text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 ${isMobile ? 'min-w-[40px]' : ''}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                {intervals.map((interval, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="text-muted-foreground min-w-[60px]">Break {index + 1}:</span>
                    <span className="font-mono text-xs sm:text-sm">
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
