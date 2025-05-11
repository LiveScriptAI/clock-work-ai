
import React, { useState } from "react";
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
import { format } from "date-fns";

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

const TimesheetLog: React.FC = () => {
  const [activeTab, setActiveTab] = useState("day");
  const filteredShifts = filterShiftsByPeriod(mockShifts, activeTab);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timesheet Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="day" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-[300px] mb-4">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
          
          {["day", "week", "month"].map((period) => (
            <TabsContent key={period} value={period}>
              <ScrollArea className="h-[320px] w-full pr-4">
                {filteredShifts.length > 0 ? (
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
                    No timesheet entries found.
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
