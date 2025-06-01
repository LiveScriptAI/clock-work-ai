
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
        
        // Enhanced mobile email handling with Gmail-specific support
        const emailUrl = `mailto:${clientEmail}?subject=${subject}&body=${body}`;
        
        // Use a longer delay and more robust approach for mobile email clients
        setTimeout(() => {
          try {
            if (isIOS) {
              console.log("Using enhanced iOS email handling...");
              
              // For iOS, create a user-initiated action to avoid popup blocking
              const userInteraction = () => {
                // Try opening email in current window first (works better for Gmail)
                try {
                  window.location.href = emailUrl;
                } catch (error) {
                  console.log("Direct location change failed, trying alternative...");
                  // Fallback: create a temporary link and click it
                  const tempLink = document.createElement('a');
                  tempLink.href = emailUrl;
                  tempLink.style.display = 'none';
                  document.body.appendChild(tempLink);
                  
                  // Use a longer timeout to ensure Gmail has time to process
                  setTimeout(() => {
                    tempLink.click();
                    document.body.removeChild(tempLink);
                  }, 100);
                }
              };
              
              // Execute immediately for better user experience
              userInteraction();
              
            } else {
              console.log("Using Android email handling...");
              // For Android, try multiple approaches
              try {
                // First try: direct window.open
                const emailWindow = window.open(emailUrl, '_blank');
                if (!emailWindow) {
                  // Second try: location change
                  window.location.href = emailUrl;
                }
              } catch (error) {
                console.log("Android email opening failed:", error);
                // Fallback: location change
                window.location.href = emailUrl;
              }
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
        }, 750); // Increased delay to ensure download completes and email app has time to process
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
