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
      <DialogContent className="sm:max-w-md mx-0">
        <DialogHeader>
          <DialogTitle>Manager Approval: Shift End</DialogTitle>
          <DialogDescription>
            Manager approval is required to end a shift. Please enter manager's name and signature.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="endManagerName" className="text-sm font-medium block mb-1">
              Manager's Name
            </label>
            <Input id="endManagerName" value={endManagerName} onChange={e => setEndManagerName(e.target.value)} placeholder="Enter manager's name" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">
              Manager's Signature
            </label>
            <SignatureCanvas onSignatureChange={setIsSignatureEmpty} width={isMobile ? 300 : 380} height={180} onSignatureCapture={setEndSignatureData} />
          </div>
          
          {startTime && <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-sm">
                <span className="font-medium">Shift started:</span> {format(startTime, "h:mm a")}
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium">Total break time:</span> {getBreakDuration()}
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium">Worked time:</span> {formatDuration(calculateTimeWorked())}
              </p>
            </div>}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={confirmShiftEnd}>Confirm End</Button>
        </div>
      </DialogContent>
    </Dialog>;
};
export default EndShiftDialog;