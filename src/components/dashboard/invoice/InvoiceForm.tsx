
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InvoiceHeader from "./InvoiceHeader";
import LineItemsTable from "./LineItemsTable";
import NotesAndTerms from "./NotesAndTerms";
import InvoiceSummary from "./InvoiceSummary";
import PreviewInvoiceDialog from "./PreviewInvoiceDialog";
import { downloadInvoicePDF, sendInvoice } from "./invoice-utils";
import { LineItem } from "./invoice-types";

// Get access to any pending autofill from TimesheetLog
declare global {
  interface Window {
    _pendingAutofill?: any;
  }
}

const InvoiceForm = () => {
  const today = new Date();
  const [customer, setCustomer] = useState<string>("");
  const [invoiceDate, setInvoiceDate] = useState<Date>(today);
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [terms, setTerms] = useState<string>("Payment due within 30 days. Late payments are subject to a 2% monthly fee.");
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: `item-${Date.now()}`,
      date: today,
      description: "",
      rateType: "Per Hour",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  // Effect to check for pending autofill when component mounts
  useEffect(() => {
    // Expose a method to add line items from external sources
    window._pendingAutofill = (shiftData: any) => {
      if (!shiftData) return;

      // Create a new line item from the shift data
      const newItem: LineItem = {
        id: `item-${Date.now()}`,
        date: shiftData.date,
        description: `${shiftData.employer} - Work on ${new Date(shiftData.date).toLocaleDateString('en-GB', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`,
        rateType: shiftData.payType || "Per Hour",
        quantity: shiftData.hoursWorked,
        unitPrice: shiftData.payRate,
      };

      addLineItem();
      
      // Update the last line item with the new data
      setLineItems(current => {
        const updated = [...current];
        updated[updated.length - 1] = newItem;
        return updated;
      });
    };

    return () => {
      // Cleanup
      delete window._pendingAutofill;
    };
  }, []);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: `item-${Date.now()}`,
        date: today,
        description: "",
        rateType: "Per Hour",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateLineTotal = (quantity: number, unitPrice: number) => {
    return (quantity * unitPrice).toFixed(2);
  };

  const calculateSubtotal = () => {
    return lineItems
      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      .toFixed(2);
  };

  const calculateVAT = () => {
    const subtotal = parseFloat(calculateSubtotal());
    return (subtotal * 0.20).toFixed(2); // Placeholder VAT rate of 20%
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const vat = parseFloat(calculateVAT());
    return (subtotal + vat).toFixed(2);
  };

  // Handler for Preview Invoice button
  const handlePreviewInvoice = () => {
    setIsPreviewOpen(true);
  };

  // Handler for Download PDF button
  const handleDownloadPDF = () => {
    const invoiceData = {
      customer,
      invoiceDate,
      reference,
      lineItems,
      notes,
      terms,
      subtotal: calculateSubtotal(),
      vat: calculateVAT(),
      total: calculateTotal()
    };
    
    downloadInvoicePDF(invoiceData);
  };

  // Handler for Send Invoice button
  const handleSendInvoice = () => {
    const customerEmail = customer ? `${customer.toLowerCase().replace(/\s/g, "")}@email.com` : "";
    sendInvoice(customerEmail);
  };

  return (
    <div className="my-8" id="invoice-form">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Invoice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header Section */}
          <InvoiceHeader 
            customer={customer}
            setCustomer={setCustomer}
            invoiceDate={invoiceDate}
            setInvoiceDate={setInvoiceDate}
            reference={reference}
            setReference={setReference}
          />

          {/* Line Items Table */}
          <div data-testid="line-items-container">
            <LineItemsTable 
              lineItems={lineItems}
              updateLineItem={updateLineItem}
              removeLineItem={removeLineItem}
              addLineItem={addLineItem}
              calculateLineTotal={calculateLineTotal}
            />
          </div>

          {/* Notes and Terms */}
          <NotesAndTerms 
            notes={notes}
            setNotes={setNotes}
            terms={terms}
            setTerms={setTerms}
          />

          {/* Financial Summary */}
          <InvoiceSummary 
            subtotal={calculateSubtotal()}
            vat={calculateVAT()}
            total={calculateTotal()}
          />
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3 justify-end">
          <Button variant="outline" className="w-full sm:w-auto" onClick={handlePreviewInvoice}>Preview Invoice</Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleDownloadPDF}>Download PDF</Button>
          <Button variant="default" className="w-full sm:w-auto" onClick={handleSendInvoice}>Send Invoice</Button>
        </CardFooter>
      </Card>

      {/* Invoice Preview Dialog */}
      <PreviewInvoiceDialog
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        customer={customer}
        invoiceDate={invoiceDate}
        reference={reference}
        lineItems={lineItems}
        notes={notes}
        terms={terms}
        subtotal={calculateSubtotal()}
        vat={calculateVAT()}
        total={calculateTotal()}
      />
    </div>
  );
};

export default InvoiceForm;
