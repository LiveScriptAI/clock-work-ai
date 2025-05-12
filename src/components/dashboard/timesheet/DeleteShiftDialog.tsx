
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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!shiftId) return;
    
    setIsDeleting(true);
    
    try {
      const result = await deleteShift(shiftId);
      
      if (result.success) {
        toast.success("Shift deleted successfully");
        onDeleted(); // Notify parent component to update UI
      } else {
        toast.error(result.error || "Failed to delete shift");
      }
    } catch (error) {
      console.error("Error deleting shift:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
      onClose();
    }
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
          <AlertDialogCancel onClick={onClose} disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteShiftDialog;
