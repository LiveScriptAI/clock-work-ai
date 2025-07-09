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
          <DialogTitle className="text-lg font-semibold">Manager Approval: Shift End</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Manager approval required to end shift.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 overflow-y-auto max-h-[calc(88vh-140px)] sm:max-h-[calc(85vh-140px)]">
          <div>
            <label htmlFor="endManagerName" className="text-sm font-medium block mb-1">
              Manager's Name
            </label>
            <Input 
              id="endManagerName" 
              value={endManagerName} 
              onChange={e => setEndManagerName(e.target.value)} 
              placeholder="Manager name" 
              className="h-10 px-3 text-base w-[85%] mx-auto" 
            />
          </div>
          
          <div className="text-center">
            <label className="text-sm font-medium block mb-1 text-left">
              Manager's Signature
            </label>
            <div className="flex justify-center">
              <SignatureCanvas 
                onSignatureChange={setIsSignatureEmpty} 
                width={260} 
                height={100} 
                onSignatureCapture={setEndSignatureData} 
              />
            </div>
          </div>
          
          {startTime && <div className="p-3 bg-muted border border-border rounded-lg">
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
        
        <div className="flex flex-col gap-2 mt-3">
          <Button 
            onClick={handleConfirm} 
            className="w-full h-10 text-base font-medium"
            disabled={!endManagerName || isSignatureEmpty}
          >
            Confirm End
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)} 
            className="w-full h-10 text-base font-medium"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};
export default EndShiftDialog;