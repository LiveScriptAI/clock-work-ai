
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
  setStartSignatureData,
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
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader className="text-center mb-2">
          <DialogTitle className="text-base font-semibold">Manager Approval: Shift Start</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Manager approval is required to start a shift.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2.5">
          <div>
            <label htmlFor="employerName" className="text-xs font-medium block mb-1">
              Employer Name
            </label>
            <Input 
              id="employerName" 
              value={employerName} 
              onChange={(e) => setEmployerName(e.target.value)} 
              placeholder="Enter employer's name" 
              required
              className="h-10 px-2.5 text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="payRate" className="text-xs font-medium block mb-1">
              Pay Rate (£)
            </label>
            <Input 
              id="payRate" 
              type="number" 
              value={payRate || ''} 
              onChange={(e) => setPayRate(parseFloat(e.target.value) || 0)} 
              placeholder="Enter pay rate"
              min="0"
              step="0.01"
              required
              className="h-10 px-2.5 text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="rateType" className="text-xs font-medium block mb-1">
              Rate Type
            </label>
            <Select value={rateType} onValueChange={setRateType}>
              <SelectTrigger id="rateType" className="h-10 text-sm">
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
            <label htmlFor="managerName" className="text-xs font-medium block mb-1">
              Manager's Name
            </label>
            <Input 
              id="managerName" 
              value={managerName} 
              onChange={(e) => setManagerName(e.target.value)} 
              placeholder="Enter manager's name"
              className="h-10 px-2.5 text-sm"
            />
          </div>
          
          <div className="text-center">
            <label className="text-xs font-medium block mb-1.5 text-left">
              Manager's Signature
            </label>
            <div className="flex justify-center">
              <SignatureCanvas 
                onSignatureChange={setIsSignatureEmpty}
                width={240} 
                height={100}
                onSignatureCapture={setStartSignatureData}
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2.5 mt-3">
          <Button 
            onClick={handleConfirm} 
            className="w-full h-10 text-sm font-medium"
            disabled={!employerName || !payRate || !rateType || !managerName || isSignatureEmpty}
          >
            Confirm Start
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)} 
            className="w-full h-10 text-sm font-medium"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartShiftDialog;
