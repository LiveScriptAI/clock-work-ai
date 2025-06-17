
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Send, Eye } from "lucide-react";
import { InvoiceData } from "./invoice-types";

interface InvoiceActionsProps {
  invoice: InvoiceData;
  onPreview: () => void;
  onDownload: () => void;
  onSend: () => void;
}

export const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  invoice,
  onPreview,
  onDownload,
  onSend,
}) => {
  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        onClick={onPreview}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Eye className="w-4 h-4" />
        Preview
      </Button>
      
      <Button
        onClick={onDownload}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Download PDF
      </Button>
      
      <Button
        onClick={onSend}
        size="sm"
        className="flex items-center gap-2"
      >
        <Send className="w-4 h-4" />
        Send Invoice
      </Button>
    </div>
  );
};
