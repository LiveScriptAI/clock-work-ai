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
  return <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs w-full mx-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-base">Manager Approval: Shift End</DialogTitle>
          <DialogDescription className="text-xs">
            Manager approval is required to end a shift. Please enter manager's name and signature.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label htmlFor="endManagerName" className="text-xs font-medium block mb-1">
              Manager's Name
            </label>
            <Input id="endManagerName" value={endManagerName} onChange={e => setEndManagerName(e.target.value)} placeholder="Enter manager's name" className="text-sm h-8" />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">
              Manager's Signature
            </label>
            <SignatureCanvas onSignatureChange={setIsSignatureEmpty} width={280} height={120} onSignatureCapture={setEndSignatureData} />
          </div>
          
          {startTime && <div className="p-2 bg-muted border border-border rounded-md">
              <p className="text-xs">
                <span className="font-medium">Shift started:</span> {format(startTime, "h:mm a")}
              </p>
              <p className="text-xs mt-1">
                <span className="font-medium">Total break time:</span> {getBreakDuration()}
              </p>
              <p className="text-xs mt-1">
                <span className="font-medium">Worked time:</span> {formatDuration(calculateTimeWorked())}
              </p>
            </div>}
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 text-sm h-8">Cancel</Button>
          <Button onClick={confirmShiftEnd} className="flex-1 text-sm h-8">Confirm End</Button>
        </div>
      </DialogContent>
    </Dialog>;
};
export default EndShiftDialog;