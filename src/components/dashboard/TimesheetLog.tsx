
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
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { toast } from "@/components/ui/use-toast";

// Import components
import DateRangePicker from "./DateRangePicker";
import ShiftsList from "./timesheet/ShiftsList";

// Import utilities and data
import { downloadCSV, downloadPDF } from "./timesheet/export-utils";
import { fetchUserShifts, filterShiftsByPeriod, filterShiftsByDateRange, deleteShift } from "@/services/shiftService";
import { ShiftEntry } from "./timesheet/types";
import { formatHoursAndMinutes } from "./utils";

const TimesheetLog: React.FC = () => {
  const [activeTab, setActiveTab] = useState("day");
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDateRangeActive, setIsDateRangeActive] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [shifts, setShifts] = useState<ShiftEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Get all shifts filtered by active tab
  const periodFilteredShifts = useMemo(
    () => filterShiftsByPeriod(shifts, activeTab),
    [shifts, activeTab]
  );
  
  // Filter shifts by date range if active
  const filteredShifts = useMemo(
    () => isDateRangeActive && dateRange?.from && dateRange?.to
      ? filterShiftsByDateRange(shifts, dateRange.from, dateRange.to)
      : periodFilteredShifts,
    [isDateRangeActive, dateRange, periodFilteredShifts]
  );

  // Fetch shifts data on component mount
  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    setIsLoading(true);
    try {
      const userShifts = await fetchUserShifts();
      setShifts(userShifts);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch shifts:", err);
      setError("Failed to load shift data");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load your timesheet data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a shift
  const handleDeleteShift = async (shiftId: string) => {
    try {
      const success = await deleteShift(shiftId);
      
      if (success) {
        // Update state to immediately remove the deleted shift from UI
        setShifts(prevShifts => prevShifts.filter(shift => shift.id !== shiftId));
        toast({
          title: "Success",
          description: "Shift deleted successfully",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete shift",
        });
      }
    } catch (error) {
      console.error("Error deleting shift:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while deleting the shift",
      });
    }
  };

  // Handle autofill to invoice functionality
  const handleAutofillInvoice = (shift: ShiftEntry) => {
    // Get the invoice form elements that need to be filled
    const descriptionField = document.querySelector("#description") as HTMLInputElement;
    const quantityField = document.querySelector("#quantity") as HTMLInputElement;
    const priceField = document.querySelector("#price") as HTMLInputElement;
    
    if (descriptionField && quantityField && priceField) {
      // Format date for the description
      const date = new Date(shift.date);
      const dateString = date.toLocaleDateString('en-GB', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Autofill the fields
      descriptionField.value = `${shift.employer} - Work on ${dateString}`;
      
      // Format the quantity as "Xh Ym" instead of decimal
      quantityField.value = formatHoursAndMinutes(shift.hoursWorked);
      
      // Set the price field (rate)
      priceField.value = shift.payRate.toString();
      
      // Simulate input events to trigger any listeners
      const event = new Event('input', { bubbles: true });
      descriptionField.dispatchEvent(event);
      quantityField.dispatchEvent(event);
      priceField.dispatchEvent(event);
      
      // Show success message
      toast({
        title: "Invoice Updated",
        description: "Shift details have been added to the invoice",
      });
      
      // Scroll to the invoice section
      const invoiceSection = document.querySelector("#invoice-form");
      if (invoiceSection) {
        invoiceSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not find invoice form fields",
      });
    }
  };

  // Handle applying the date range filter
  const handleApplyFilter = () => {
    if (dateRange?.from && dateRange?.to) {
      setIsLoading(true);
      
      // Simulate loading delay
      setTimeout(() => {
        setIsDateRangeActive(true);
        setIsLoading(false);
      }, 300);
    }
  };

  // Handle resetting the date range filter
  const handleResetFilter = () => {
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setDateRange(undefined);
      setIsDateRangeActive(false);
      setIsLoading(false);
    }, 200);
  };

  // Export handlers
  const handleExportCSV = () => {
    setIsExporting('csv');
    setTimeout(() => {
      downloadCSV(filteredShifts);
      setIsExporting(null);
    }, 500);
  };

  const handleExportPDF = () => {
    setIsExporting('pdf');
    setTimeout(() => {
      downloadPDF(filteredShifts);
      setIsExporting(null);
    }, 500);
  };

  // Reset date range filter when tab changes
  useEffect(() => {
    if (isDateRangeActive) {
      setIsDateRangeActive(false);
      setDateRange(undefined);
    }
  }, [activeTab]);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <CardTitle>Timesheet Log</CardTitle>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={isLoading || isExporting !== null || filteredShifts.length === 0}
            className="w-full sm:w-auto"
          >
            {isExporting === 'csv' ? 'Exporting...' : 'Download CSV'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={isLoading || isExporting !== null || filteredShifts.length === 0}
            className="w-full sm:w-auto"
          >
            {isExporting === 'pdf' ? 'Exporting...' : 'Download PDF'}
          </Button>
        </div>
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
        
        <Tabs defaultValue="day" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-[300px] mb-4">
            <TabsTrigger value="day" disabled={isLoading}>Day</TabsTrigger>
            <TabsTrigger value="week" disabled={isLoading}>Week</TabsTrigger>
            <TabsTrigger value="month" disabled={isLoading}>Month</TabsTrigger>
          </TabsList>
          
          {["day", "week", "month"].map((period) => (
            <TabsContent key={period} value={period}>
              <ShiftsList
                shifts={filteredShifts}
                isLoading={isLoading}
                isDateRangeActive={isDateRangeActive}
                error={error}
                onDeleteShift={handleDeleteShift}
                onAutofillInvoice={handleAutofillInvoice}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TimesheetLog;
