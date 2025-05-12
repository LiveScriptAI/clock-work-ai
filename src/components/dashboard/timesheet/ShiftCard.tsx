
import React from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Trash, Plus } from "lucide-react";
import { ShiftEntry } from "./types";

interface ShiftCardProps {
  shift: ShiftEntry;
  onDeleteClick: (shiftId: string) => void;
  onAutofillClick: (shift: ShiftEntry) => void;
}

const ShiftCard: React.FC<ShiftCardProps> = ({ 
  shift, 
  onDeleteClick,
  onAutofillClick 
}) => {
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
        <div className="flex gap-2 mt-2 justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAutofillClick(shift)}
          >
            <Plus className="mr-1 h-4 w-4" /> Autofill to Invoice
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
            onClick={() => onDeleteClick(shift.id)}
          >
            <Trash className="mr-1 h-4 w-4" /> Delete Shift
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ShiftCard;
