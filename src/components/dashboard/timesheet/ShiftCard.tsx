
import React from "react";
import { format, parseISO } from "date-fns";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ShiftCardProps {
  shift: ShiftEntry;
  onDelete: (shiftId: string) => Promise<void>;
}

const ShiftCard: React.FC<ShiftCardProps> = ({ shift, onDelete }) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [breaksOpen, setBreaksOpen] = React.useState(false);

  // Debug logging
  console.log("ShiftCard rendering with shift:", shift);
  console.log("Break intervals:", shift.breakIntervals);

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

  // Helper function to calculate interval duration in seconds
  const intervalsToSeconds = (interval: { start: string; end: string }) => {
    if (!interval.end) return 0;
    const startTime = parseISO(interval.start);
    const endTime = parseISO(interval.end);
    return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
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

        {/* Break intervals section - Always show if intervals exist */}
        {shift.breakIntervals && shift.breakIntervals.length > 0 && (
          <div className="mt-3 border-t pt-3">
            <Collapsible open={breaksOpen} onOpenChange={setBreaksOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 px-3 rounded-md">
                <span className="font-semibold">Break Times ({shift.breakIntervals.length})</span>
                {breaksOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="space-y-3">
                  {shift.breakIntervals.map((interval, i) => (
                    <div key={i} className="break-interval bg-blue-50 border border-blue-200 p-3 rounded-md">
                      <div className="text-sm font-medium text-blue-900 mb-2">Break {i + 1}</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start:</span>
                          <span className="font-medium">{format(parseISO(interval.start), 'HH:mm:ss')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">End:</span>
                          <span className="font-medium">{format(parseISO(interval.end), 'HH:mm:ss')}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm mt-2 pt-2 border-t border-blue-200">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold text-blue-700">{formatDuration(intervalsToSeconds(interval))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Debug info - remove this after testing */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 text-xs text-gray-400 bg-gray-100 p-2 rounded">
            Debug: {shift.breakIntervals?.length || 0} break intervals found
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
