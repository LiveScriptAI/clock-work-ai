import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InvoiceHeader from "./InvoiceHeader";
import LineItemsTable from "./LineItemsTable";
import NotesAndTerms from "./NotesAndTerms";
import InvoiceSummary from "./InvoiceSummary";
import PreviewInvoiceDialog from "./PreviewInvoiceDialog";
import InvoiceActions from "./InvoiceActions";
import { sendInvoice, generateInvoicePDF } from "./invoice-utils";
import { convertInvoiceToShift } from "./invoice-conversion-utils";
import { LineItem } from "./invoice-types";
import { ShiftEntry } from "../timesheet/types";
import { toast } from "@/hooks/use-toast";
import CompanySelector from "./CompanySelector";
import MyCompanyForm from "./MyCompanyForm";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InvoiceSettingsType, fetchInvoiceSettings } from "@/services/invoiceSettingsService";

// Get access to any pending autofill from TimesheetLog
declare global {
  interface Window {
    _pendingAutofill?: (shiftData: ShiftEntry) => void;
  }
}
const InvoiceForm = () => {
  const {
    user
  } = useAuth();
  const today = new Date();
  const [customer, setCustomer] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [invoiceDate, setInvoiceDate] = useState<Date>(today);
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [terms, setTerms] = useState<string>("Payment due within 30 days. Late payments are subject to a 2% monthly fee.");
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [sender, setSender] = useState<InvoiceSettingsType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Add state for address fields
  const [address1, setAddress1] = useState<string>("");
  const [address2, setAddress2] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [county, setCounty] = useState<string>("");
  const [postcode, setPostcode] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [lineItems, setLineItems] = useState<LineItem[]>([{
    id: `item-${Date.now()}`,
    date: today,
    description: "",
    rateType: "Per Hour",
    quantity: 1,
    unitPrice: 0
  }]);

  // Fetch sender information when component mounts
  useEffect(() => {
    const loadSenderInfo = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await fetchInvoiceSettings(user.id);
        if (data) {
          setSender(data);
        }
      } catch (error) {
        console.error("Failed to load company settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSenderInfo();
  }, [user]);

  // Handle company selection
  const handleCompanySelect = (companyData: any) => {
    if (!companyData) return;

    // Update invoice form fields with company data
    setCustomer(companyData.company_name || "");
    setCustomerEmail(companyData.email || "");

    // Update address fields
    setAddress1(companyData.address1 || "");
    setAddress2(companyData.address2 || "");
    setCity(companyData.city || "");
    setCounty(companyData.county || "");
    setPostcode(companyData.postcode || "");
    setCountry(companyData.country || "");

    // If there are notes from the company, update the notes field
    if (companyData.notes) {
      setNotes(companyData.notes);
    }

    // If there are terms from the company, update the terms field
    if (companyData.terms_conditions) {
      setTerms(companyData.terms_conditions);
    }

    // Add reference with company name if empty
    if (!reference) {
      setReference(`Invoice for ${companyData.company_name}`);
    }
    toast({
      title: "Company Loaded",
      description: `Invoice details updated with ${companyData.company_name}`
    });
  };

  // Effect to check for pending autofill when component mounts
  useEffect(() => {
    // Expose a method to add line items from external sources
    window._pendingAutofill = (shiftData: ShiftEntry) => {
      if (!shiftData) return;

      // Check if we already have this shift in the line items
      const shiftAlreadyAdded = lineItems.some(item => item.description?.includes(shiftData.employer) && item.date?.toDateString() === shiftData.date.toDateString() && Math.abs(item.quantity - shiftData.hoursWorked) < 0.01 && item.unitPrice === shiftData.payRate);
      if (shiftAlreadyAdded) {
        toast({
          title: "Already Added",
          description: "This shift has already been added to the invoice",
          variant: "destructive"
        });
        return;
      }

      // Create a new line item from the shift data
      const newItem: LineItem = {
        id: `item-${Date.now()}-${shiftData.id}`,
        date: shiftData.date,
        description: `${shiftData.employer} - Work on ${new Date(shiftData.date).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`,
        rateType: shiftData.payType || "Per Hour",
        quantity: shiftData.hoursWorked,
        unitPrice: shiftData.payRate
      };

      // Add the new line item to the existing items
      setLineItems(current => [...current, newItem]);
      toast({
        title: "Success",
        description: "Shift added to invoice"
      });
    };
    return () => {
      // Cleanup
      delete window._pendingAutofill;
    };
  }, [lineItems]);
  const addLineItem = () => {
    setLineItems([...lineItems, {
      id: `item-${Date.now()}`,
      date: today,
      description: "",
      rateType: "Per Hour",
      quantity: 1,
      unitPrice: 0
    }]);
  };
  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter(item => item.id !== id));
  };
  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => item.id === id ? {
      ...item,
      [field]: value
    } : item));
  };
  const calculateLineTotal = (quantity: number, unitPrice: number) => {
    return (quantity * unitPrice).toFixed(2);
  };
  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2);
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

  // Convert invoice data to shift for InvoiceActions
  const getShiftData = (): ShiftEntry => {
    return convertInvoiceToShift(customer, invoiceDate, reference, lineItems, customerEmail);
  };

  // Handler for Send Invoice button
  const handleSendInvoice = () => {
    // Include sender information with invoice data
    const invoiceData = {
      customer,
      customerEmail,
      // Include the actual customer email
      invoiceDate,
      reference,
      notes,
      terms,
      subtotal: calculateSubtotal(),
      vat: calculateVAT(),
      total: calculateTotal(),
      address1,
      address2,
      city,
      county,
      postcode,
      country
    };
    sendInvoice(invoiceData);
  };

  // Handler for Preview Invoice button
  const handlePreviewInvoice = () => {
    setIsPreviewOpen(true);
  };

  // Handler for Download PDF button
  const handleDownloadPDF = async () => {
    if (!sender) {
      toast({
        title: "Missing company information",
        description: "Please set up your company information first",
        variant: "destructive"
      });
      return;
    }
    const invoiceData = {
      customer,
      customerEmail,
      // Include the actual customer email
      invoiceDate,
      reference,
      lineItems,
      notes,
      terms,
      subtotal: calculateSubtotal(),
      vat: calculateVAT(),
      total: calculateTotal(),
      address1,
      address2,
      city,
      county,
      postcode,
      country
    };
    try {
      const pdfBlob = await generateInvoicePDF(invoiceData, sender);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${reference || Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: "Invoice PDF downloaded successfully"
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate invoice PDF",
        variant: "destructive"
      });
    }
  };
  return <div className="my-8" id="invoice-form">
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Invoice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display Sender Information if available */}
          {sender && <Card className="mb-4">
              <CardContent className="pt-4">
                <h3 className="text-sm font-semibold mb-2">From</h3>
                <p>{sender.business_name}</p>
                <p>{sender.address1}</p>
                {sender.address2 && <p>{sender.address2}</p>}
                <p>
                  {sender.city}
                  {sender.county ? `, ${sender.county}` : ""} {sender.postcode}
                </p>
                <p>{sender.country}</p>
              </CardContent>
            </Card>}
        
          {/* Company Selection Tabs */}
          <Tabs defaultValue="load-company" className="my-6">
            <TabsList>
              <TabsTrigger value="load-company">Load Company</TabsTrigger>
              <TabsTrigger value="my-company">My Company</TabsTrigger>
            </TabsList>
            
            <TabsContent value="load-company">
              {/* Existing Company Selector */}
              <CompanySelector onSelect={handleCompanySelect} />
            </TabsContent>
            
            <TabsContent value="my-company">
              {/* My Company Form */}
              <MyCompanyForm />
            </TabsContent>
          </Tabs>
          
          {/* Header Section */}
          <InvoiceHeader customer={customer} setCustomer={setCustomer} customerEmail={customerEmail} setCustomerEmail={setCustomerEmail} invoiceDate={invoiceDate} setInvoiceDate={setInvoiceDate} reference={reference} setReference={setReference} address1={address1} setAddress1={setAddress1} address2={address2} setAddress2={setAddress2} city={city} setCity={setCity} county={county} setCounty={setCounty} postcode={postcode} setPostcode={setPostcode} country={country} setCountry={setCountry} />

          {/* Line Items Table */}
          <div data-testid="line-items-container">
            <LineItemsTable lineItems={lineItems} updateLineItem={updateLineItem} removeLineItem={removeLineItem} addLineItem={addLineItem} calculateLineTotal={calculateLineTotal} />
          </div>

          {/* Notes and Terms */}
          <NotesAndTerms notes={notes} setNotes={setNotes} terms={terms} setTerms={setTerms} />

          {/* Financial Summary */}
          <InvoiceSummary subtotal={calculateSubtotal()} vat={calculateVAT()} total={calculateTotal()} />
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3 justify-end">
          <Button variant="outline" className="w-full sm:w-auto" onClick={handlePreviewInvoice}>Preview Invoice</Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleDownloadPDF}>Download PDF</Button>
          
          {/* Updated Invoice Actions Component with all address props */}
          <div className="w-full sm:w-auto">
            <InvoiceActions shift={getShiftData()} clientEmail={customerEmail} customer={customer} invoiceDate={invoiceDate} reference={reference} lineItems={lineItems} notes={notes} terms={terms} subtotal={calculateSubtotal()} vat={calculateVAT()} total={calculateTotal()} address1={address1} address2={address2} city={city} county={county} postcode={postcode} country={country} />
          </div>
        </CardFooter>
      </Card>

      {/* Invoice Preview Dialog */}
      <PreviewInvoiceDialog isOpen={isPreviewOpen} onOpenChange={setIsPreviewOpen} customer={customer} customerEmail={customerEmail} invoiceDate={invoiceDate} reference={reference} lineItems={lineItems} notes={notes} terms={terms} subtotal={calculateSubtotal()} vat={calculateVAT()} total={calculateTotal()} address1={address1} address2={address2} city={city} county={county} postcode={postcode} country={country} sender={sender} />
    </div>;
};
export default InvoiceForm;
