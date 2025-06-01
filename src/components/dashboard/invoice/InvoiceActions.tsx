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

      // Enhanced mobile detection
      const isMobileDevice = isMobile || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      console.log("Mobile device detected:", isMobileDevice);
      console.log("iOS device detected:", isIOS);

      // Try Web Share API first for mobile devices
      if (navigator.share && isMobileDevice) {
        try {
          console.log("Attempting Web Share API...");
          
          // Check if we can share files
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            console.log("Sharing with file attachment...");
            await navigator.share({
              files: [file],
              title: `Invoice #${shift.id}`,
              text: `Invoice #${shift.id} for work on ${shift.date.toLocaleDateString()}. Total: £${shift.earnings.toFixed(2)}`,
            });
            toast.success("Invoice shared successfully");
            return;
          } else {
            console.log("File sharing not supported, sharing text only...");
            await navigator.share({
              title: `Invoice #${shift.id}`,
              text: `Invoice #${shift.id} for work performed on ${shift.date.toLocaleDateString()}. Total amount: £${shift.earnings.toFixed(2)}. Please find the PDF attachment in your downloads.`,
            });
            
            // Download the PDF separately
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice-${shift.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            toast.success("Invoice downloaded and sharing options opened");
            return;
          }
        } catch (shareError) {
          console.log("Web Share cancelled or failed:", shareError);
          // Continue to fallback below
        }
      }

      // Fallback: Download PDF first, then handle email
      console.log("Using fallback method...");
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${shift.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Construct email parameters
      const subject = encodeURIComponent(`Invoice #${shift.id}`);
      const body = encodeURIComponent(
        `Hi,\n\nPlease find attached Invoice #${shift.id} for work performed on ${shift.date.toLocaleDateString()}.\n\nTotal amount: £${shift.earnings.toFixed(2)}\n\nThanks!`
      );
      
      if (isMobileDevice) {
        console.log("Opening email client on mobile...");
        
        // Gmail-friendly approach - use window.location directly without DOM manipulation
        const emailUrl = `mailto:${clientEmail}?subject=${subject}&body=${body}`;
        
        // Give download time to complete, then open email with minimal interference
        setTimeout(() => {
          try {
            if (isIOS) {
              console.log("Opening email app on iOS with Gmail-friendly method...");
              // Use window.location directly - this is less likely to interfere with Gmail
              window.location.href = emailUrl;
              
            } else {
              console.log("Opening email app on Android...");
              // For Android, direct window.location works better
              window.location.href = emailUrl;
            }
          } catch (error) {
            console.error("Error opening email client:", error);
            // Copy email to clipboard as last resort
            if (navigator.clipboard) {
              navigator.clipboard.writeText(clientEmail).then(() => {
                toast.success("Email address copied to clipboard. Please attach the downloaded PDF manually.");
              }).catch(() => {
                toast.success("Invoice downloaded. Please email it manually to: " + clientEmail);
              });
            } else {
              toast.success("Invoice downloaded. Please email it manually to: " + clientEmail);
            }
          }
        }, 2000); // Longer delay to ensure download completes and reduce interference
      } else {
        // Desktop behavior
        console.log("Opening email client on desktop...");
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
