import React from "react";
import { format, parseISO, differenceInSeconds } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus } from "lucide-react";
import { ShiftEntry } from "./types";
import { formatHoursAndMinutes, formatDuration } from "@/components/dashboard/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface ShiftCardProps {
  shift: ShiftEntry;
  onDelete: (shiftId: string) => Promise<void>;
}

// Helper function to calculate seconds between two dates
const secondsBetween = (start: Date, end: Date): number => {
  return differenceInSeconds(end, start);
};

const ShiftCard: React.FC<ShiftCardProps> = ({ shift, onDelete }) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Debug logging
  console.log("ShiftCard - shift data:", {
    id: shift.id,
    date: shift.date,
    hasBreakIntervals: !!shift.breakIntervals,
    breakIntervalsLength: shift.breakIntervals?.length || 0,
    breakIntervals: shift.breakIntervals
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(shift.id);
    setIsDeleting(false);
  };

  const handleAddToInvoice = () => {
    try {
      if (window._pendingAutofill) {
        window._pendingAutofill(shift);
        toast({
          title: "Success",
          description: "Shift added to invoice",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invoice form not ready. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error adding shift to invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add shift to invoice",
      });
    }
  };

  return (
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
            <p className="text-muted-foreground">Hours Worked:</p>
            <p>{formatHoursAndMinutes(shift.hoursWorked)}</p>
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

        {/* Debug section - temporary */}
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>Break intervals exist: {shift.breakIntervals ? 'Yes' : 'No'}</p>
          <p>Break intervals count: {shift.breakIntervals?.length || 0}</p>
          {shift.breakIntervals && (
            <p>Raw data: {JSON.stringify(shift.breakIntervals, null, 2)}</p>
          )}
        </div>

        {/* Break intervals section */}
        {shift.breakIntervals && shift.breakIntervals.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Breaks</h4>
            <div className="space-y-2">
              {shift.breakIntervals.map((interval, idx) => {
                // Handle ISO strings (updated data format)
                const start = parseISO(interval.start);
                const end = interval.end ? parseISO(interval.end) : new Date();
                const durSeconds = secondsBetween(start, end);
                
                return (
                  <div key={idx} className="grid grid-cols-3 gap-4 text-xs bg-gray-50 p-2 rounded">
                    <div>
                      <span className="text-gray-500 font-medium">Start:</span><br/>
                      <span className="font-mono">{format(start, 'HH:mm:ss')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">End:</span><br/>
                      <span className="font-mono">{interval.end ? format(end, 'HH:mm:ss') : '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Duration:</span><br/>
                      <span className="font-mono">{formatDuration(durSeconds)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-2 space-y-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                disabled={isDeleting}
              >
                <Trash2 size={14} className="mr-1" />
                {isDeleting ? "Deleting..." : "Delete Shift"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the shift 
                  from {format(shift.date, "MMMM d")} with {shift.employer}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full text-blue-500 border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <Plus size={14} className="mr-1" />
                Add to Invoice
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Add to Invoice</AlertDialogTitle>
                <AlertDialogDescription>
                  Do you want to add this shift to your invoice?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleAddToInvoice} className="bg-blue-500 hover:bg-blue-600">
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
};

export default ShiftCard;
