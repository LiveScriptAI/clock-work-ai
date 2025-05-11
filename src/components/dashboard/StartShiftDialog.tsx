
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SignatureCanvas from "@/components/SignatureCanvas";
import { useIsMobile } from "@/hooks/use-mobile";

type StartShiftDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  managerName: string;
  setManagerName: (name: string) => void;
  isSignatureEmpty: boolean;
  setIsSignatureEmpty: (empty: boolean) => void;
  confirmShiftStart: () => void;
};

const StartShiftDialog: React.FC<StartShiftDialogProps> = ({
  isOpen,
  onOpenChange,
  managerName,
  setManagerName,
  isSignatureEmpty,
  setIsSignatureEmpty,
  confirmShiftStart,
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manager Approval: Shift Start</DialogTitle>
          <DialogDescription>
            Manager approval is required to start a shift. Please enter manager's name and signature.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="managerName" className="text-sm font-medium block mb-1">
              Manager's Name
            </label>
            <Input 
              id="managerName" 
              value={managerName} 
              onChange={(e) => setManagerName(e.target.value)} 
              placeholder="Enter manager's name" 
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">
              Manager's Signature
            </label>
            <SignatureCanvas 
              onSignatureChange={setIsSignatureEmpty}
              width={isMobile ? 300 : 380} 
              height={180}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={confirmShiftStart}>Confirm Start</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartShiftDialog;
