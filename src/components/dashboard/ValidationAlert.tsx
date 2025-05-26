
import React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Check } from "lucide-react";

type ValidationAlertProps = {
  showValidationAlert: boolean;
  setShowValidationAlert: (show: boolean) => void;
  validationType: string;
};

const ValidationAlert: React.FC<ValidationAlertProps> = ({
  showValidationAlert,
  setShowValidationAlert,
  validationType,
}) => {
  const getValidationMessage = () => {
    switch (validationType) {
      case 'employer':
        return "Please enter an employer name before starting the shift.";
      case 'manager':
        return "Please enter a manager name before starting the shift.";
      case 'endManager':
        return "Please enter a manager name before ending the shift.";
      case 'startSignature':
        return "Please provide a signature before starting the shift.";
      case 'endSignature':
        return "Please provide a signature before ending the shift.";
      case 'start':
        return "Please provide both manager's name and signature before starting the shift.";
      case 'end':
        return "Please provide both manager's name and signature before ending the shift.";
      default:
        return "Please provide the required information to continue.";
    }
  };

  return (
    <AlertDialog open={showValidationAlert} onOpenChange={setShowValidationAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Missing Information</AlertDialogTitle>
          <AlertDialogDescription>
            {getValidationMessage()}
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
