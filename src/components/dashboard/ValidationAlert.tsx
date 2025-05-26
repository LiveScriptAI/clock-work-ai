
import React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Check } from "lucide-react";

type ValidationAlertProps = {
  showValidationAlert: boolean;
  setShowValidationAlert: (show: boolean) => void;
  validationType: 'start' | 'end';
};

const ValidationAlert: React.FC<ValidationAlertProps> = ({
  showValidationAlert,
  setShowValidationAlert,
  validationType,
}) => {
  return (
    <AlertDialog open={showValidationAlert} onOpenChange={setShowValidationAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Missing Information</AlertDialogTitle>
          <AlertDialogDescription>
            {validationType === 'start' 
              ? "Please provide both manager's name and signature before starting the shift." 
              : "Please provide both manager's name and signature before ending the shift."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setShowValidationAlert(false)}>
            <Check className="mr-2 h-4 w-4" />
            Understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ValidationAlert;
