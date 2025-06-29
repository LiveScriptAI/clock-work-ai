
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Download } from "lucide-react";
import { toast } from "sonner";
import { ShiftEntry } from "@/components/dashboard/timesheet/types";
import { generateInvoicePDF } from "./invoice-utils";
import { fetchInvoiceSettings } from "@/services/invoiceLocalService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineItem } from "./invoice-types";

interface InvoiceActionsProps {
  shift: ShiftEntry;
  clientEmail?: string;
  customer: string;
  invoiceDate: Date;
  reference: string;
  lineItems: LineItem[];
  notes: string;
  terms: string;
  subtotal: string;
  vat: string;
  total: string;
  address1: string;
  address2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
  isVatRegistered?: boolean;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  shift,
  clientEmail,
  customer,
  invoiceDate,
  reference,
  lineItems,
  notes,
  terms,
  subtotal,
  vat,
  total,
  address1,
  address2,
  city,
  county,
  postcode,
  country,
  isVatRegistered = true
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const generatePDF = async () => {
    try {
      // Load company info with better error handling
      const senderInfo = await fetchInvoiceSettings();
      if (!senderInfo || !senderInfo.business_name || !senderInfo.contact_name) {
        toast.error("Please complete your company details in the My Company tab first");
        return null;
      }

      // Build invoice payload
      const invoiceData = {
        customer,
        customerEmail: clientEmail,
        contactName: "", // Will be populated from customer data if available
        invoiceDate,
        reference,
        lineItems,
        notes,
        terms,
        subtotal,
        vat,
        total,
        address1,
        address2,
        city,
        county,
        postcode,
        country,
        isVatRegistered
      };

      // Generate PDF blob
      return await generateInvoicePDF(invoiceData, senderInfo);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const pdfBlob = await generatePDF();
      if (!pdfBlob) return;

      const fileName = `Invoice-${reference || shift.id}.pdf`;
      
      // For mobile devices, create download link
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Invoice PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download invoice PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareInvoice = async () => {
    setIsGenerating(true);
    try {
      const pdfBlob = await generatePDF();
      if (!pdfBlob) return;

      const fileName = `Invoice-${reference || shift.id}.pdf`;
      const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

      // Check if Web Share API is supported and can share files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: `Invoice ${reference}`,
            text: `Please find attached Invoice ${reference}.`
          });
          toast.success("Share dialog opened successfully");
        } catch (shareError: any) {
          // If user cancels share dialog, don't show error
          if (shareError.name !== 'AbortError') {
            console.error("Share failed:", shareError);
            // Fallback to download
            handleDownloadPDF();
          }
        }
      } else {
        // Fallback: download for manual attach
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Downloaded PDF - please attach it in your email app");
      }
    } catch (error) {
      console.error("Error sharing invoice:", error);
      toast.error("Failed to share invoice");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!clientEmail) {
    return (
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download PDF"}
          </Button>
          <Button disabled size="sm" variant="outline" className="w-full sm:w-auto">
            <Mail className="w-4 h-4 mr-2" />
            Share Invoice
          </Button>
        </div>
        <Alert>
          <AlertDescription>
            Enter a client email address to enable sharing
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        onClick={handleDownloadPDF}
        disabled={isDownloading}
        size="sm"
        variant="outline"
        className="w-full sm:w-auto"
      >
        <Download className="w-4 h-4 mr-2" />
        {isDownloading ? "Downloading..." : "Download PDF"}
      </Button>
      <Button
        onClick={handleShareInvoice}
        disabled={isGenerating}
        size="sm"
        variant="outline"
        className="w-full sm:w-auto"
      >
        <Mail className="w-4 h-4 mr-2" />
        {isGenerating ? "Processing..." : "Share Invoice"}
      </Button>
    </div>
  );
};

export default InvoiceActions;
