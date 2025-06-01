import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ShiftEntry } from "@/components/dashboard/timesheet/types";
import { generateInvoicePDF, convertShiftToInvoice, downloadInvoicePDF } from "./invoice-utils";
import { fetchInvoiceSettings } from "@/services/invoiceSettingsService";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";

interface InvoiceActionsProps {
  shift: ShiftEntry;
  clientEmail?: string;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({ shift, clientEmail }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();

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

      // Check if we're on a mobile device
      const isMobileDevice = isMobile || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // For mobile devices, use a much simpler approach
      if (isMobileDevice) {
        // Always download the PDF first
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-${shift.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Create simple mailto link
        const subject = encodeURIComponent(`Invoice #${shift.id}`);
        const body = encodeURIComponent(
          `Hi,\n\nPlease find attached Invoice #${shift.id} for work performed on ${shift.date.toLocaleDateString()}.\n\nTotal amount: £${shift.earnings.toFixed(2)}\n\nThanks!`
        );
        
        const mailtoUrl = `mailto:${clientEmail}?subject=${subject}&body=${body}`;
        
        // Use the most direct method possible - just set the window location
        // This is the least interfering way and should keep Gmail open
        window.location.href = mailtoUrl;
        
        toast.success("Invoice downloaded. Opening email app...");
        return;
      }

      // Desktop behavior - try Web Share API first, then fallback
      if (navigator.share) {
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Invoice #${shift.id}`,
              text: `Please find attached Invoice #${shift.id} for work performed on ${shift.date.toLocaleDateString()}. Total amount: £${shift.earnings.toFixed(2)}`,
            });
            toast.success("Invoice shared successfully");
            return;
          }
        } catch (shareError) {
          console.log("Web Share cancelled or failed:", shareError);
        }
      }

      // Desktop fallback: download PDF and open email client
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${shift.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

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
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleDownloadInvoice}
            disabled={isGenerating}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Download Invoice"}
          </Button>
          <Button 
            disabled={true}
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
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
    <div className="flex flex-col sm:flex-row gap-2">
      <Button 
        onClick={handleDownloadInvoice}
        disabled={isGenerating}
        size="sm"
        className="w-full sm:w-auto"
      >
        <Download className="w-4 h-4 mr-2" />
        {isGenerating ? "Generating..." : "Download Invoice"}
      </Button>
      <Button 
        onClick={handleEmailInvoice}
        disabled={isGenerating}
        size="sm"
        variant="outline"
        className="w-full sm:w-auto"
      >
        <Mail className="w-4 h-4 mr-2" />
        {isGenerating ? "Sending..." : "Email Invoice"}
      </Button>
    </div>
  );
};

export default InvoiceActions;
