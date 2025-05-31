
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

      // Enhanced mobile detection and sharing
      const isMobileDevice = isMobile || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Try Web Share API first (especially good for mobile)
      if (navigator.share && isMobileDevice) {
        try {
          // For mobile, try sharing with files if supported
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Invoice #${shift.id}`,
              text: `Please find attached Invoice #${shift.id} for work performed on ${shift.date.toLocaleDateString()}. Total amount: £${shift.earnings.toFixed(2)}`,
            });
            toast.success("Invoice shared successfully");
            return;
          } else {
            // Fallback for mobile - share without file but with email info
            await navigator.share({
              title: `Invoice #${shift.id}`,
              text: `Please find attached Invoice #${shift.id} for work performed on ${shift.date.toLocaleDateString()}. Total amount: £${shift.earnings.toFixed(2)}. Email: ${clientEmail}`,
            });
            // Still download the PDF for manual attachment
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice-${shift.id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Invoice downloaded and sharing options opened");
            return;
          }
        } catch (shareError) {
          console.log("Web Share cancelled or failed:", shareError);
          // Continue to fallback below
        }
      }

      // Fallback for all devices: download PDF and open email client
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${shift.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      // Construct email with better mobile support
      const subject = encodeURIComponent(`Invoice #${shift.id}`);
      const body = encodeURIComponent(
        `Hi,\n\nPlease find attached Invoice #${shift.id} for work performed on ${shift.date.toLocaleDateString()}.\n\nTotal amount: £${shift.earnings.toFixed(2)}\n\nThanks!`
      );
      
      // Use different approaches for mobile vs desktop
      if (isMobileDevice) {
        // For mobile, try different email schemes
        const emailUrl = `mailto:${clientEmail}?subject=${subject}&body=${body}`;
        
        // Try to open email app
        try {
          const emailWindow = window.open(emailUrl, '_self');
          // If window.open returns null, try alternative method
          if (!emailWindow) {
            // Create a temporary link and click it
            const emailLink = document.createElement('a');
            emailLink.href = emailUrl;
            emailLink.style.display = 'none';
            document.body.appendChild(emailLink);
            emailLink.click();
            document.body.removeChild(emailLink);
          }
        } catch (error) {
          console.error("Error opening email client on mobile:", error);
          // Last resort - copy email to clipboard
          navigator.clipboard?.writeText(clientEmail).then(() => {
            toast.success("Email address copied to clipboard. Please attach the downloaded PDF manually.");
          });
        }
      } else {
        // Desktop behavior
        window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`, '_blank');
      }
      
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
