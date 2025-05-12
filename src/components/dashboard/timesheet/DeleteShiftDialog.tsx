
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
import { deleteShift } from "@/services/shiftService";
import { toast } from "sonner";

interface DeleteShiftDialogProps {
  isOpen: boolean;
  shiftId: string | null;
  onClose: () => void;
  onDeleted: () => void;
}

const DeleteShiftDialog: React.FC<DeleteShiftDialogProps> = ({
  isOpen,
  shiftId,
  onClose,
  onDeleted,
}) => {
  const handleDelete = async () => {
    if (!shiftId) return;
    
    const result = await deleteShift(shiftId);
    
    if (result.success) {
      toast.success("Shift deleted successfully");
      onDeleted();
    } else {
      toast.error(result.error || "Failed to delete shift");
    }
    
    onClose();
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Shift</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete this shift log?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteShiftDialog;
