
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ShiftEntry } from "@/components/dashboard/timesheet/types";
import { generateInvoicePDF } from "./invoice-utils";
import { fetchInvoiceSettings } from "@/services/invoiceSettingsService";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineItem } from "./invoice-types";

interface InvoiceActionsProps {
  shift: ShiftEntry;
  clientEmail?: string;
  // Add address field props
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
  const { user } = useAuth();

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

      // Create invoice data with all the address fields (same as Download PDF logic)
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
      
      const pdfBlob = await generateInvoicePDF(invoiceData, senderInfo);
      
      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${reference || shift.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      // Open email client with pre-filled content using the actual client email
      const subject = encodeURIComponent(`Invoice #${reference || shift.id}`);
      const body = encodeURIComponent(
        `Hi,\n\nPlease find attached Invoice #${reference || shift.id} for work performed on ${invoiceDate.toLocaleDateString()}.\n\nTotal amount: £${total}\n\nPlease attach the downloaded PDF file to this email before sending.\n\nThanks!`
      );
      
      // Use the actual client email in the mailto link
      window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`, '_blank');
      
      toast.success("Invoice downloaded and email client opened. Please attach the PDF to your email.");
      
    } catch (error) {
      console.error("Error processing invoice:", error);
      toast.error("Failed to process invoice");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!clientEmail) {
    return (
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
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
  );
};

export default InvoiceActions;
