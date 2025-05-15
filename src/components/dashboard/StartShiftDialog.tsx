import React, { useEffect } from "react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  employerName: string;
  setEmployerName: (name: string) => void;
  payRate: number;
  setPayRate: (rate: number) => void;
  rateType: string;
  setRateType: (type: string) => void;
  setStartSignatureData: (data: string | null) => void;
};

const StartShiftDialog: React.FC<StartShiftDialogProps> = ({
  isOpen,
  onOpenChange,
  managerName,
  setManagerName,
  isSignatureEmpty,
  setIsSignatureEmpty,
  confirmShiftStart,
  employerName,
  setEmployerName,
  payRate,
  setPayRate,
  rateType,
  setRateType,
  setStartSignatureData,
}) => {
  const isMobile = useIsMobile();

  useEffect(() => {
    console.log("🪪 StartShiftDialog - isOpen changed to:", isOpen);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPortal>
        {/* back-drop */}
        <DialogOverlay className="fixed inset-0 bg-black/30 z-40" />

        {/* the actual dialog panel */}
        <DialogContent className="
            fixed 
            top-1/2 left-1/2 
            z-50 
            w-full max-w-md 
            -translate-x-1/2 -translate-y-1/2 
            bg-white p-6 rounded-lg shadow-lg
          ">
          <DialogHeader>
            <DialogTitle>Manager Approval: Shift Start</DialogTitle>
            <DialogDescription>
              Enter manager’s name and signature to begin your shift.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="employerName" className="text-sm font-medium block mb-1">
                Employer Name
              </label>
              <Input
                id="employerName"
                value={employerName}
                onChange={(e) => setEmployerName(e.target.value)}
                placeholder="Enter employer’s name"
                required
              />
            </div>

            <div>
              <label htmlFor="payRate" className="text-sm font-medium block mb-1">
                Pay Rate (£)
              </label>
              <Input
                id="payRate"
                type="number"
                value={payRate || ""}
                onChange={(e) => setPayRate(parseFloat(e.target.value) || 0)}
                placeholder="Enter pay rate"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label htmlFor="rateType" className="text-sm font-medium block mb-1">
                Rate Type
              </label>
              <Select value={rateType} onValueChange={setRateType}>
                <SelectTrigger id="rateType">
                  <SelectValue placeholder="Select rate type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Per Hour">Per Hour</SelectItem>
                  <SelectItem value="Per Day">Per Day</SelectItem>
                  <SelectItem value="Per Week">Per Week</SelectItem>
                  <SelectItem value="Per Month">Per Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="managerName" className="text-sm font-medium block mb-1">
                Manager’s Name
              </label>
              <Input
                id="managerName"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="Enter manager’s name"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Manager’s Signature
              </label>
              <SignatureCanvas
                onSignatureChange={setIsSignatureEmpty}
                width={isMobile ? 300 : 380}
                height={180}
                onSignatureCapture={setStartSignatureData}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmShiftStart}>
              Confirm Start
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default StartShiftDialog;

