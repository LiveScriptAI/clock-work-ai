
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShiftEntry } from "./types";
import { LineItem } from "../invoice/invoice-types";
import { toast } from "sonner";

interface AutofillInvoiceDialogProps {
  isOpen: boolean;
  shift: ShiftEntry | null;
  onClose: () => void;
  onAutofill: (lineItem: LineItem) => void;
}

const AutofillInvoiceDialog: React.FC<AutofillInvoiceDialogProps> = ({
  isOpen,
  shift,
  onClose,
  onAutofill,
}) => {
  const handleAutofill = () => {
    if (!shift) return;
    
    // Convert shift to a line item
    const lineItem: LineItem = {
      id: `item-${Date.now()}`,
      date: shift.date,
      description: `Work for ${shift.employer} - ${shift.hoursWorked.toFixed(1)} hours`,
      rateType: shift.payType,
      quantity: shift.hoursWorked,
      unitPrice: shift.payRate,
    };
    
    onAutofill(lineItem);
    toast.success("Shift added to invoice");
    onClose();
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add to Invoice</AlertDialogTitle>
          <AlertDialogDescription>
            Do you want to add this shift log to your invoice?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAutofill}>
            Add to Invoice
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AutofillInvoiceDialog;
