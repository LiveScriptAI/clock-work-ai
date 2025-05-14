
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecipientForm } from "./RecipientForm";
import { InvoiceRecipient } from "@/services/invoiceRecipientService";

interface EditRecipientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: InvoiceRecipient;
  onUpdated: () => void;
}

export function EditRecipientDialog({
  isOpen,
  onClose,
  recipient,
  onUpdated,
}: EditRecipientDialogProps) {
  const handleComplete = () => {
    onUpdated();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Recipient</DialogTitle>
        </DialogHeader>
        <RecipientForm 
          existingRecipient={recipient} 
          onComplete={handleComplete}
        />
      </DialogContent>
    </Dialog>
  );
}
