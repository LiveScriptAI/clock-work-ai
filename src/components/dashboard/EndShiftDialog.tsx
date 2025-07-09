import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SignatureCanvas from "@/components/SignatureCanvas";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
type EndShiftDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  endManagerName: string;
  setEndManagerName: (name: string) => void;
  isSignatureEmpty: boolean;
  setIsSignatureEmpty: (empty: boolean) => void;
  confirmShiftEnd: () => void;
  startTime: Date | null;
  formatDuration: (seconds: number) => string;
  calculateTimeWorked: () => number;
  getBreakDuration: () => string;
  setEndSignatureData: (data: string | null) => void;
};
const EndShiftDialog: React.FC<EndShiftDialogProps> = ({
  isOpen,
  onOpenChange,
  endManagerName,
  setEndManagerName,
  isSignatureEmpty,
  setIsSignatureEmpty,
  confirmShiftEnd,
  startTime,
  formatDuration,
  calculateTimeWorked,
  getBreakDuration,
  setEndSignatureData
}) => {
  const isMobile = useIsMobile();
  
  // Handle form reset when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form fields when dialog closes
      setEndManagerName('');
      setIsSignatureEmpty(true);
      setEndSignatureData(null);
    }
    onOpenChange(open);
  };
  
  // Handle confirm with proper mobile feedback
  const handleConfirm = () => {
    confirmShiftEnd();
    // Form will be reset by handleOpenChange when dialog closes
  };
  return <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader className="text-center mb-2">
          <DialogTitle className="text-base font-semibold">Manager Approval: Shift End</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Manager approval is required to end a shift.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2.5">
          <div>
            <label htmlFor="endManagerName" className="text-xs font-medium block mb-1">
              Manager's Name
            </label>
            <Input 
              id="endManagerName" 
              value={endManagerName} 
              onChange={e => setEndManagerName(e.target.value)} 
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
                onSignatureCapture={setEndSignatureData} 
              />
            </div>
          </div>
          
          {startTime && <div className="p-2.5 bg-muted border border-border rounded-lg">
              <p className="text-xs mb-1">
                <span className="font-medium">Shift started:</span> {format(startTime, "h:mm a")}
              </p>
              <p className="text-xs mb-1">
                <span className="font-medium">Total break time:</span> {getBreakDuration()}
              </p>
              <p className="text-xs">
                <span className="font-medium">Worked time:</span> {formatDuration(calculateTimeWorked())}
              </p>
            </div>}
        </div>
        
        <div className="flex flex-col gap-2.5 mt-3">
          <Button 
            onClick={handleConfirm} 
            className="w-full h-10 text-sm font-medium"
            disabled={!endManagerName || isSignatureEmpty}
          >
            Confirm End
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
    </Dialog>;
};
export default EndShiftDialog;