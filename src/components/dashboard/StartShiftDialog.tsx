
import React, { useState, useEffect } from "react";
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
  
  useEffect(() => {
    console.log("🪪 StartShiftDialog - isOpen changed to:", isOpen);
  }, [isOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log("🪪 Dialog onOpenChange called with:", open);
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manager Approval: Shift Start</DialogTitle>
          <DialogDescription>
            Manager approval is required to start a shift. Please enter manager's name and signature.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="employerName" className="text-sm font-medium block mb-1">
              Employer Name
            </label>
            <Input 
              id="employerName" 
              value={employerName} 
              onChange={(e) => setEmployerName(e.target.value)} 
              placeholder="Enter employer's name" 
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
              value={payRate || ''} 
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
              onSignatureCapture={setStartSignatureData}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => {
            console.log("🪪 Cancel button clicked");
            onOpenChange(false);
          }}>Cancel</Button>
          <Button onClick={() => {
            console.log("🪪 Confirm Start button clicked");
            confirmShiftStart();
          }}>Confirm Start</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartShiftDialog;
