
import React from "react";
import { format, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus } from "lucide-react";
import { ShiftEntry } from "./types";
import { formatHoursAndMinutes, formatSecondsAsHMS } from "@/components/dashboard/utils";
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

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(shift.id);
    setIsDeleting(false);
  };

  const handleAddToInvoice = () => {
    try {
      if (window._pendingAutofill) {
        window._pendingAutofill(shift);
        toast({ title: "Success", description: "Shift added to invoice" });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invoice form not ready. Please try again.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add shift to invoice",
      });
    }
  };

  // Calculate seconds from ISO interval
  const secondsBetween = (interval: { start: string; end: string | null }) => {
    if (!interval.end) return 0;
    const s = parseISO(interval.start);
    const e = parseISO(interval.end);
    return Math.floor((e.getTime() - s.getTime()) / 1000);
  };

  console.log("▶️ ShiftCard received breakIntervals:", shift.breakIntervals);

  return (
    <Card className="p-4 border border-gray-200">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{format(shift.date, "EEEE, MMMM d")}</h3>
            <p className="text-sm text-muted-foreground">{shift.employer}</p>
          </div>
          <Badge variant={shift.status === "Paid" ? "default" : "outline"}>
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

        {/* Break intervals */}
        {shift.breakIntervals?.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <Collapsible open={true} onOpenChange={setBreaksOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 px-3 rounded-md">
                <span className="font-semibold">Breaks ({shift.breakIntervals.length})</span>
                {breaksOpen ? <ChevronDown /> : <ChevronRight />}
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-2 space-y-4">
                {shift.breakIntervals.map((iv, i) => {
                  const secs = secondsBetween(iv);
                  return (
                    <div key={i} className="text-sm">
                      <div className="flex justify-between">
                        <span>Start:</span>
                        <span>{format(parseISO(iv.start), 'HH:mm:ss')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>End:</span>
                        <span>{iv.end ? format(parseISO(iv.end), 'HH:mm:ss') : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{formatSecondsAsHMS(secs)}</span>
                      </div>
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        <div className="mt-4 space-y-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full text-red-500" disabled={isDeleting}>
                <Trash2 size={14} className="mr-1" />
                {isDeleting ? 'Deleting...' : 'Delete Shift'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
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
              <Button variant="outline" size="sm" className="w-full text-blue-500">
                <Plus size={14} className="mr-1" />
                Add to Invoice
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Add to Invoice</AlertDialogTitle>
                <AlertDialogDescription>
                  Confirm adding this shift to your invoice.
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
