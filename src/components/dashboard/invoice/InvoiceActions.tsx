import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
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
  country
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShareInvoice = async () => {
    setIsGenerating(true);
    try {
      // Load “My Company” info
      const senderInfo = await fetchInvoiceSettings();
      if (!senderInfo) {
        toast.error("Please set up your company details in the My Company tab first");
        return;
      }

      // Build invoice payload
      const invoiceData = {
        customer,
        customerEmail: clientEmail,
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
        country
      };

      // Generate PDF blob
      const pdfBlob = await generateInvoicePDF(invoiceData, senderInfo);
      const fileName = `Invoice-${reference || shift.id}.pdf`;
      const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

      // Web Share API
      if (navigator.canShare?.({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: `Invoice ${reference}`,
          text: `Please find attached Invoice ${reference}.`
        });
        toast.success("Share dialog opened — choose your Mail app.");
      } else {
        // Fallback: download for manual attach
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Downloaded PDF — please attach it in your email app.");
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
