
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertCircle } from "lucide-react";
import ShiftCard from "./ShiftCard";
import EmptyState from "./EmptyState";
import { ShiftEntry } from "./types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DeleteShiftDialog from "./DeleteShiftDialog";
import AutofillInvoiceDialog from "./AutofillInvoiceDialog";
import { LineItem } from "../invoice/invoice-types";

interface ShiftsListProps {
  shifts: ShiftEntry[];
  isLoading: boolean;
  isDateRangeActive: boolean;
  error: string | null;
  onRefresh: () => void;
  onAutofillInvoice: (lineItem: LineItem) => void;
}

const ShiftsList: React.FC<ShiftsListProps> = ({ 
  shifts, 
  isLoading, 
  isDateRangeActive,
  error,
  onRefresh,
  onAutofillInvoice
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAutofillDialogOpen, setIsAutofillDialogOpen] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftEntry | null>(null);

  const handleDeleteClick = (shiftId: string) => {
    setSelectedShiftId(shiftId);
    setIsDeleteDialogOpen(true);
  };

  const handleAutofillClick = (shift: ShiftEntry) => {
    setSelectedShift(shift);
    setIsAutofillDialogOpen(true);
  };

  return (
    <ScrollArea className="h-[320px] w-full pr-4">
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : shifts.length > 0 ? (
        <div className="space-y-4">
          {shifts.map((shift) => (
            <ShiftCard 
              key={shift.id} 
              shift={shift} 
              onDeleteClick={handleDeleteClick}
              onAutofillClick={handleAutofillClick}
            />
          ))}
        </div>
      ) : (
        <EmptyState isDateRangeActive={isDateRangeActive} />
      )}

      <DeleteShiftDialog 
        isOpen={isDeleteDialogOpen} 
        shiftId={selectedShiftId} 
        onClose={() => setIsDeleteDialogOpen(false)}
        onDeleted={onRefresh}
      />

      <AutofillInvoiceDialog
        isOpen={isAutofillDialogOpen}
        shift={selectedShift}
        onClose={() => setIsAutofillDialogOpen(false)}
        onAutofill={onAutofillInvoice}
      />
    </ScrollArea>
  );
};

export default ShiftsList;
