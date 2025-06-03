
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Download, AlertCircle, Copy, Share } from "lucide-react";
import { toast } from "sonner";
import { ShiftEntry } from "@/components/dashboard/timesheet/types";
import { generateInvoicePDF, convertShiftToInvoice, downloadInvoicePDF } from "./invoice-utils";
import { fetchInvoiceSettings } from "@/services/invoiceSettingsService";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import { FileAttachment } from "./invoice-types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InvoiceActionsProps {
  shift: ShiftEntry;
  clientEmail?: string;
  attachments?: FileAttachment[];
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({ shift, clientEmail, attachments = [] }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEmailOptions, setShowEmailOptions] = useState(false);
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

      console.log('Downloading invoice with attachments:', attachments.length);
      const invoiceData = convertShiftToInvoice(shift, clientEmail, attachments);
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

    // Check if we're on a mobile device
    const isMobileDevice = isMobile || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobileDevice) {
      // On mobile, show options dialog instead of forcing mailto
      setShowEmailOptions(true);
      return;
    }

    // Desktop behavior - try Web Share API first, then fallback
    setIsGenerating(true);
    try {
      const senderInfo = await fetchInvoiceSettings(user.id);
      if (!senderInfo) {
        toast.error("Please set up your company information in Invoice Settings first");
        return;
      }

      console.log('Emailing invoice with attachments:', attachments.length);
      const invoiceData = convertShiftToInvoice(shift, clientEmail, attachments);
      const pdfBlob = await generateInvoicePDF(invoiceData, senderInfo);
      const file = new File([pdfBlob], `Invoice-${shift.id}.pdf`, { type: 'application/pdf' });

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

  const handleMobileEmailOption = async (option: 'download' | 'copy' | 'share') => {
    if (!user || !clientEmail) return;

    setIsGenerating(true);
    try {
      const senderInfo = await fetchInvoiceSettings(user.id);
      if (!senderInfo) {
        toast.error("Please set up your company information in Invoice Settings first");
        return;
      }

      console.log('Mobile email option with attachments:', attachments.length);
      const invoiceData = convertShiftToInvoice(shift, clientEmail, attachments);
      
      if (option === 'download') {
        // Just download the PDF
        await downloadInvoicePDF(invoiceData, senderInfo);
        toast.success("Invoice downloaded! You can now attach it manually to your email.");
      } else if (option === 'copy') {
        // Copy email template to clipboard
        const emailTemplate = `To: ${clientEmail}
Subject: Invoice #${shift.id}

Hi,

Please find attached Invoice #${shift.id} for work performed on ${shift.date.toLocaleDateString()}.

Total amount: £${shift.earnings.toFixed(2)}

Thanks!`;

        await navigator.clipboard.writeText(emailTemplate);
        toast.success("Email template copied to clipboard! Download the PDF separately and attach it.");
      } else if (option === 'share') {
        // Use native share for the PDF if available
        const pdfBlob = await generateInvoicePDF(invoiceData, senderInfo);
        const file = new File([pdfBlob], `Invoice-${shift.id}.pdf`, { type: 'application/pdf' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Invoice #${shift.id}`,
            text: `Invoice for ${clientEmail}`,
          });
          toast.success("Invoice shared successfully");
        } else {
          // Fallback to download
          await downloadInvoicePDF(invoiceData, senderInfo);
          toast.success("Invoice downloaded! Share feature not available on this device.");
        }
      }
    } catch (error) {
      console.error("Error handling mobile email option:", error);
      toast.error("Failed to process request");
    } finally {
      setIsGenerating(false);
      setShowEmailOptions(false);
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
    <>
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
          {isGenerating ? "Processing..." : "Email Invoice"}
        </Button>
      </div>

      {/* Mobile Email Options Dialog */}
      <Dialog open={showEmailOptions} onOpenChange={setShowEmailOptions}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Email Invoice Options</DialogTitle>
            <DialogDescription>
              Choose how you'd like to send the invoice to {clientEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Button 
              onClick={() => handleMobileEmailOption('download')}
              disabled={isGenerating}
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-3" />
              Download PDF & Email Manually
            </Button>
            <Button 
              onClick={() => handleMobileEmailOption('copy')}
              disabled={isGenerating}
              className="w-full justify-start"
              variant="outline"
            >
              <Copy className="w-4 h-4 mr-3" />
              Copy Email Template
            </Button>
            <Button 
              onClick={() => handleMobileEmailOption('share')}
              disabled={isGenerating}
              className="w-full justify-start"
              variant="outline"
            >
              <Share className="w-4 h-4 mr-3" />
              Share PDF via Apps
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            These options avoid forcing your email app to close and give you full control over the sending process.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvoiceActions;
