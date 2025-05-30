
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ShiftEntry } from "@/components/dashboard/timesheet/types";
import { generateInvoicePDF, convertShiftToInvoice, downloadInvoicePDF } from "./invoice-utils";
import { fetchInvoiceSettings } from "@/services/invoiceSettingsService";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InvoiceActionsProps {
  shift: ShiftEntry;
  clientEmail?: string;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({ shift, clientEmail }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();

  const handleDownloadInvoice = async () => {
    if (!user) {
      toast.error("Please log in to generate invoices");
      return;
    }

    setIsGenerating(true);
    try {
      const senderInfo = await fetchInvoiceSettings(user.id);
      if (!senderInfo) {
        toast.error("Please set up your company information in Invoice Settings first");
        return;
      }

      const invoiceData = convertShiftToInvoice(shift, clientEmail);
      await downloadInvoicePDF(invoiceData, senderInfo);
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailInvoice = async () => {
    if (!clientEmail) {
      toast.error("Client email is required to send invoice");
      return;
    }

    if (!user) {
      toast.error("Please log in to send invoices");
      return;
    }

    setIsGenerating(true);
    try {
      const senderInfo = await fetchInvoiceSettings(user.id);
      if (!senderInfo) {
        toast.error("Please set up your company information in Invoice Settings first");
        return;
      }

      const invoiceData = convertShiftToInvoice(shift, clientEmail);
      const pdfBlob = await generateInvoicePDF(invoiceData, senderInfo);
      const file = new File([pdfBlob], `Invoice-${shift.id}.pdf`, { type: 'application/pdf' });

      // Check if Web Share API is supported
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Invoice #${shift.id}`,
            text: 'Please find the invoice attached.',
          });
          toast.success("Invoice shared successfully");
          return;
        } catch (shareError) {
          console.log("Web Share cancelled or failed, falling back to download + mailto");
        }
      }

      // Fallback: download then mailto
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${shift.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      // Open email client
      const subject = encodeURIComponent(`Invoice #${shift.id}`);
      const body = encodeURIComponent(
        `Hi,\n\nPlease find attached Invoice #${shift.id} for work performed on ${shift.date.toLocaleDateString()}.\n\nTotal amount: £${shift.earnings.toFixed(2)}\n\nThanks!`
      );
      window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`, '_blank');
      
      toast.success("Invoice downloaded and email client opened");
    } catch (error) {
      console.error("Error emailing invoice:", error);
      toast.error("Failed to email invoice");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!clientEmail) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button 
            onClick={handleDownloadInvoice}
            disabled={isGenerating}
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Download Invoice"}
          </Button>
          <Button 
            disabled={true}
            size="sm"
            variant="outline"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Invoice
          </Button>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Add a client email address to enable email functionality
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button 
        onClick={handleDownloadInvoice}
        disabled={isGenerating}
        size="sm"
      >
        <Download className="w-4 h-4 mr-2" />
        {isGenerating ? "Generating..." : "Download Invoice"}
      </Button>
      <Button 
        onClick={handleEmailInvoice}
        disabled={isGenerating}
        size="sm"
        variant="outline"
      >
        <Mail className="w-4 h-4 mr-2" />
        {isGenerating ? "Sending..." : "Email Invoice"}
      </Button>
    </div>
  );
};

export default InvoiceActions;
