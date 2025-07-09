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
      <DialogContent className="w-full">
        <DialogHeader className="text-center mb-4">
          <DialogTitle className="text-lg font-semibold">Manager Approval: Shift End</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Manager approval is required to end a shift. Please enter manager's name and signature.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 px-2">
          <div>
            <label htmlFor="endManagerName" className="text-sm font-medium block mb-2">
              Manager's Name
            </label>
            <Input 
              id="endManagerName" 
              value={endManagerName} 
              onChange={e => setEndManagerName(e.target.value)} 
              placeholder="Enter manager's name" 
              className="h-10 px-3" 
            />
          </div>
          
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium block mb-2 self-start">
              Manager's Signature
            </label>
            <div className="w-full flex justify-center">
              <SignatureCanvas 
                onSignatureChange={setIsSignatureEmpty} 
                width={300} 
                height={140} 
                onSignatureCapture={setEndSignatureData} 
              />
            </div>
          </div>
          
          {startTime && <div className="p-3 bg-muted border border-border rounded-lg mx-1">
              <p className="text-sm mb-1">
                <span className="font-medium">Shift started:</span> {format(startTime, "h:mm a")}
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium">Total break time:</span> {getBreakDuration()}
              </p>
              <p className="text-sm">
                <span className="font-medium">Worked time:</span> {formatDuration(calculateTimeWorked())}
              </p>
            </div>}
        </div>
        
        <div className="flex flex-col gap-3 mt-6 px-2">
          <Button 
            onClick={handleConfirm} 
            className="w-full h-12 text-base font-medium"
            disabled={!endManagerName || isSignatureEmpty}
          >
            Confirm End
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)} 
            className="w-full h-12 text-base font-medium"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};
export default EndShiftDialog;