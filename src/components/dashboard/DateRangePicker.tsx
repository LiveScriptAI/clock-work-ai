
import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as DayPickerCalendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onApplyFilter: () => void;
  onResetFilter: () => void;
  isLoading: boolean;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onDateRangeChange,
  onApplyFilter,
  onResetFilter,
  isLoading
}) => {
  // Add state to control popover open/close
  const [isOpen, setIsOpen] = useState(false);

  // Format selected date range as text
  const formatSelectedRange = () => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
    }
    return null;
  };

  // Handle apply filter and close popover
  const handleApplyFilter = () => {
    onApplyFilter();
    setIsOpen(false); // Close the popover
  };

  // Handle reset filter
  const handleResetFilter = () => {
    onResetFilter();
    // Don't close popover on reset to allow for new selection
  };

  const selectedRange = formatSelectedRange();

  return (
    <div className="flex flex-col items-start mb-4">
      <div className="flex items-center gap-2 w-full justify-between">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "pl-3 flex gap-1 items-center",
                dateRange?.from && dateRange?.to ? "text-foreground" : "text-muted-foreground"
              )}
              disabled={isLoading}
            >
              <CalendarIcon className="h-4 w-4" />
              <span>Filter by date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DayPickerCalendar
              initialFocus
              mode="range"
              selected={dateRange}
              onSelect={(range) => onDateRangeChange(range)}
              numberOfMonths={1}
              className={cn("p-3 pointer-events-auto")}
            />
            <div className="p-3 border-t border-border flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilter}
                disabled={isLoading || (!dateRange?.from && !dateRange?.to)}
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleApplyFilter}
                disabled={isLoading || !dateRange?.from || !dateRange?.to}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Filtering...
                  </>
                ) : (
                  "Apply Filter"
                )}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {isLoading && (
          <div className="flex items-center">
            <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
            <span className="text-sm text-muted-foreground">Filtering...</span>
          </div>
        )}
      </div>

      {selectedRange && !isLoading && (
        <div className="mt-2 text-sm">
          <span className="text-muted-foreground">Showing results for:</span>{" "}
          <span className="font-medium">{selectedRange}</span>
          {dateRange?.from && dateRange?.to && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onResetFilter} 
              className="ml-2 h-6 px-2"
              disabled={isLoading}
            >
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
