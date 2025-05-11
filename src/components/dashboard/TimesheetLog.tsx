import React, { useState, useEffect, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import DateRangePicker from "./DateRangePicker";
import { Loader2 } from "lucide-react";

// Mock data for the timesheet entries
const mockShifts = [
  {
    id: "1",
    date: new Date(2025, 4, 9), // May 9, 2025
    employer: "ABC Construction",
    startTime: new Date(2025, 4, 9, 8, 0), // 8:00 AM
    endTime: new Date(2025, 4, 9, 16, 30), // 4:30 PM
    breakDuration: 30, // minutes
    hoursWorked: 8,
    earnings: 120,
    payRate: 15,
    payType: "Per Hour",
    status: "Paid"
  },
  {
    id: "2",
    date: new Date(2025, 4, 8), // May 8, 2025
    employer: "XYZ Retail",
    startTime: new Date(2025, 4, 8, 9, 0), // 9:00 AM
    endTime: new Date(2025, 4, 8, 17, 0), // 5:00 PM
    breakDuration: 45, // minutes
    hoursWorked: 7.25,
    earnings: 108.75,
    payRate: 15,
    payType: "Per Hour",
    status: "Unpaid"
  },
  {
    id: "3",
    date: new Date(2025, 4, 6), // May 6, 2025
    employer: "123 Logistics",
    startTime: new Date(2025, 4, 6, 7, 30), // 7:30 AM
    endTime: new Date(2025, 4, 6, 16, 0), // 4:00 PM
    breakDuration: 60, // minutes
    hoursWorked: 7.5,
    earnings: 112.5,
    payRate: 15,
    payType: "Per Hour",
    status: "Paid"
  },
  {
    id: "4",
    date: new Date(2025, 4, 5), // May 5, 2025
    employer: "Acme Warehousing",
    startTime: new Date(2025, 4, 5, 8, 0), // 8:00 AM
    endTime: new Date(2025, 4, 5, 16, 0), // 4:00 PM
    breakDuration: 30, // minutes
    hoursWorked: 7.5,
    earnings: 150,
    payRate: 20,
    payType: "Per Hour",
    status: "Paid"
  },
  {
    id: "5",
    date: new Date(2025, 4, 4), // May 4, 2025
    employer: "Global Shipping Co.",
    startTime: new Date(2025, 4, 4, 9, 0), // 9:00 AM
    endTime: new Date(2025, 4, 4, 17, 30), // 5:30 PM
    breakDuration: 45, // minutes
    hoursWorked: 7.75,
    earnings: 775,
    payRate: 100,
    payType: "Per Day",
    status: "Unpaid"
  }
];

// Filter timesheet entries based on selected time period
const filterShiftsByPeriod = (shifts: typeof mockShifts, period: string) => {
  const now = new Date();
  
  switch (period) {
    case "day":
      return shifts.filter(shift => 
        shift.date.getDate() === now.getDate() &&
        shift.date.getMonth() === now.getMonth() &&
        shift.date.getFullYear() === now.getFullYear()
      );
    case "week":
      // Simple approximation - get shifts from the past 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return shifts.filter(shift => shift.date >= oneWeekAgo);
    case "month":
      // Get shifts from the current month
      return shifts.filter(shift => 
        shift.date.getMonth() === now.getMonth() &&
        shift.date.getFullYear() === now.getFullYear()
      );
    default:
      return shifts;
  }
};

// Filter shifts by date range
const filterShiftsByDateRange = (
  shifts: typeof mockShifts,
  fromDate: Date | undefined,
  toDate: Date | undefined
) => {
  if (!fromDate || !toDate) return shifts;

  return shifts.filter((shift) => {
    const shiftDate = startOfDay(shift.date);
    return isWithinInterval(shiftDate, {
      start: startOfDay(fromDate),
      end: endOfDay(toDate),
    });
  });
};

const TimesheetLog: React.FC = () => {
  const [activeTab, setActiveTab] = useState("day");
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [isDateRangeActive, setIsDateRangeActive] = useState(false);
  
  // Get all shifts filtered by active tab
  const periodFilteredShifts = useMemo(
    () => filterShiftsByPeriod(mockShifts, activeTab),
    [activeTab]
  );
  
  // Filter shifts by date range if active
  const filteredShifts = useMemo(
    () => isDateRangeActive 
      ? filterShiftsByDateRange(mockShifts, dateRange.from, dateRange.to)
      : periodFilteredShifts,
    [isDateRangeActive, dateRange, periodFilteredShifts]
  );

  // Handle applying the date range filter
  const handleApplyFilter = () => {
    if (dateRange.from && dateRange.to) {
      setIsLoading(true);
      
      // Simulate loading delay for mock data
      setTimeout(() => {
        setIsDateRangeActive(true);
        setIsLoading(false);
      }, 800);
    }
  };

  // Handle resetting the date range filter
  const handleResetFilter = () => {
    setIsLoading(true);
    
    // Simulate loading delay for mock data
    setTimeout(() => {
      setDateRange({ from: undefined, to: undefined });
      setIsDateRangeActive(false);
      setIsLoading(false);
    }, 500);
  };

  // Reset date range filter when tab changes
  useEffect(() => {
    if (isDateRangeActive) {
      setIsDateRangeActive(false);
      setDateRange({ from: undefined, to: undefined });
    }
  }, [activeTab]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timesheet Log</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Date Range Picker */}
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onApplyFilter={handleApplyFilter}
          onResetFilter={handleResetFilter}
          isLoading={isLoading}
        />
        
        <Tabs defaultValue="day" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-[300px] mb-4">
            <TabsTrigger value="day" disabled={isLoading}>Day</TabsTrigger>
            <TabsTrigger value="week" disabled={isLoading}>Week</TabsTrigger>
            <TabsTrigger value="month" disabled={isLoading}>Month</TabsTrigger>
          </TabsList>
          
          {["day", "week", "month"].map((period) => (
            <TabsContent key={period} value={period}>
              <ScrollArea className="h-[320px] w-full pr-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredShifts.length > 0 ? (
                  <div className="space-y-4">
                    {filteredShifts.map((shift) => (
                      <Card key={shift.id} className="p-4 border border-gray-200">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{format(shift.date, "EEEE, MMMM d")}</h3>
                              <p className="text-sm text-muted-foreground">{shift.employer}</p>
                            </div>
                            <Badge 
                              variant={shift.status === "Paid" ? "default" : "outline"}
                              className={shift.status === "Paid" ? "bg-green-500" : ""}
                            >
                              {shift.status}
                            </Badge>
                          </div>
                          <Separator className="my-1" />
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Start Time:</p>
                              <p>{format(shift.startTime, "h:mm a")}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">End Time:</p>
                              <p>{format(shift.endTime, "h:mm a")}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Break:</p>
                              <p>{shift.breakDuration} minutes</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Hours Worked:</p>
                              <p>{shift.hoursWorked.toFixed(1)}h</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Earnings:</p>
                              <p>£{shift.earnings.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Rate:</p>
                              <p>£{shift.payRate} {shift.payType}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full text-muted-foreground">
                    {isDateRangeActive
                      ? "No shifts found for selected dates."
                      : "No timesheet entries found."}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TimesheetLog;
