import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  setStartSignatureData
}) => {
  const isMobile = useIsMobile();

  // Handle form reset when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form fields when dialog closes
      setManagerName('');
      setEmployerName('');
      setPayRate(0);
      setRateType('');
      setIsSignatureEmpty(true);
      setStartSignatureData(null);
    }
    onOpenChange(open);
  };

  // Handle confirm with proper mobile feedback
  const handleConfirm = () => {
    confirmShiftStart();
    // Form will be reset by handleOpenChange when dialog closes
  };
  return <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader className="text-center mb-2">
          <DialogTitle className="text-lg font-semibold">Manager Approval: Shift Start</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Manager approval required to start shift.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 overflow-y-auto max-h-[calc(88vh-140px)] sm:max-h-[calc(85vh-140px)]">
          <div>
            <label htmlFor="employerName" className="text-sm font-medium block mb-1 mx-[12px]">
              Employer Name
            </label>
            <Input id="employerName" value={employerName} onChange={e => setEmployerName(e.target.value)} placeholder="Employer name" required className="h-10 px-3 text-base w-[85%] mx-auto" />
          </div>
          
          <div>
            <label htmlFor="payRate" className="text-sm font-medium block mb-1 mx-[12px]">
              Pay Rate (£)
            </label>
            <Input id="payRate" type="number" value={payRate || ''} onChange={e => setPayRate(parseFloat(e.target.value) || 0)} placeholder="Pay rate" min="0" step="0.01" required className="h-10 px-3 text-base w-[85%] mx-auto" />
          </div>
          
          <div>
            <label htmlFor="rateType" className="text-sm font-medium block mb-1 mx-[12px]">
              Rate Type
            </label>
            <Select value={rateType} onValueChange={setRateType}>
              <SelectTrigger id="rateType" className="h-10 text-base w-[85%] mx-auto">
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
            <label htmlFor="managerName" className="text-sm font-medium block mb-1 mx-[12px]">
              Manager's Name
            </label>
            <Input id="managerName" value={managerName} onChange={e => setManagerName(e.target.value)} placeholder="Manager name" className="h-10 px-3 text-base w-[85%] mx-auto" />
          </div>
          
          <div className="text-center">
            <label className="text-sm font-medium block mb-1 text-left mx-[14px]">
              Manager's Signature
            </label>
            <div className="flex justify-center">
              <SignatureCanvas onSignatureChange={setIsSignatureEmpty} width={260} height={100} onSignatureCapture={setStartSignatureData} />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 mt-3">
          <Button onClick={handleConfirm} disabled={!employerName || !payRate || !rateType || !managerName || isSignatureEmpty} className="w-full h-10 text-base font-medium mx-0 px-0 py-0 my-0">
            Confirm Start
          </Button>
          <Button variant="outline" onClick={() => handleOpenChange(false)} className="w-full h-10 text-base font-medium">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};
export default StartShiftDialog;