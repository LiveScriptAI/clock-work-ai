
import React, { useState, useEffect, useCallback } from "react";
import { load } from "@/services/localStorageService";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import InvoiceHeader from "./InvoiceHeader";
import LineItemsTable from "./LineItemsTable";
import NotesAndTerms from "./NotesAndTerms";
import InvoiceSummary from "./InvoiceSummary";
import PreviewInvoiceDialog from "./PreviewInvoiceDialog";
import CompanySelector from "./CompanySelector";
import MyCompanyForm from "./MyCompanyForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InvoiceSettingsType } from "@/services/invoiceLocalService";
import { generateInvoicePDF } from "./invoice-utils";
import { convertInvoiceToShift } from "./invoice-conversion-utils";
import { ShiftEntry } from "../timesheet/types";
import { LineItem } from "./invoice-types";

const InvoiceForm: React.FC = () => {
  const today = new Date();

  // Invoice form fields
  const [customer, setCustomer] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date>(today);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState(
    "Payment due within 30 days. Late payments are subject to a 2% monthly fee."
  );
  const [isVatRegistered, setIsVatRegistered] = useState(true);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: `item-${Date.now()}`, date: today, description: "", rateType: "Per Hour", quantity: 1, unitPrice: 0 }
  ]);

  // Customer address fields
  const [customerAddress1, setCustomerAddress1] = useState("");
  const [customerAddress2, setCustomerAddress2] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerCounty, setCustomerCounty] = useState("");
  const [customerPostcode, setCustomerPostcode] = useState("");
  const [customerCountry, setCustomerCountry] = useState("");

  // "My Company" (sender) data
  const [sender, setSender] = useState<InvoiceSettingsType | null>(null);
  const [settingsVersion, setSettingsVersion] = useState(0);

  // Reload company settings from localStorage
  const loadCompanySettings = useCallback(() => {
    const data = load<InvoiceSettingsType>("companySettings");
    if (data && data.business_name && data.address1) {
      setSender(data);
    } else {
      setSender(null);
    }
  }, []);

  useEffect(() => {
    loadCompanySettings();
  }, [loadCompanySettings, settingsVersion]);

  // Expose pending autofill for "Add to Invoice"
  useEffect(() => {
    window._pendingAutofill = (shiftData: ShiftEntry) => {
      // Prevent duplicates
      const exists = lineItems.some(item =>
        item.description.includes(shiftData.employer) &&
        item.date.toDateString() === shiftData.date.toDateString() &&
        Math.abs(item.quantity - shiftData.hoursWorked) < 0.01 &&
        item.unitPrice === shiftData.payRate
      );
      if (exists) {
        toast({ title: "Already Added", description: "This shift is already on the invoice", variant: "destructive" });
        return;
      }

      // Create new line item
      const newItem: LineItem = {
        id: `item-${Date.now()}-${shiftData.id}`,
        date: shiftData.date,
        description: `${shiftData.employer} - Work on ${shiftData.date.toLocaleDateString("en-GB")}`,
        rateType: shiftData.payType || "Per Hour",
        quantity: shiftData.hoursWorked,
        unitPrice: shiftData.payRate
      };

      setLineItems(items => [...items, newItem]);
      toast({ title: "Success", description: "Shift added to invoice" });
    };

    return () => {
      delete window._pendingAutofill;
    };
  }, [lineItems]);

  // CompanySelector (billing "To:" side)
  const handleCompanySelect = (companyData: any) => {
    if (!companyData) return;
    
    console.log("Selected company data:", companyData);
    
    // Set all customer fields
    setCustomer(companyData.company_name || "");
    setCustomerEmail(companyData.email || "");
    setContactName(companyData.contact_name || "");
    setCustomerAddress1(companyData.address1 || "");
    setCustomerAddress2(companyData.address2 || "");
    setCustomerCity(companyData.city || "");
    setCustomerCounty(companyData.county || "");
    setCustomerPostcode(companyData.postcode || "");
    setCustomerCountry(companyData.country || "");
    setReference(r => r || `Invoice for ${companyData.company_name}`);
    
    // Load customer's saved notes and terms if available
    if (companyData.notes) {
      setNotes(companyData.notes);
    }
    if (companyData.terms_conditions) {
      setTerms(companyData.terms_conditions);
    }
    
    toast({ title: "Customer Loaded", description: `Now invoicing ${companyData.company_name}.` });
  };

  // Line-item helpers
  const addLineItem = () => {
    setLineItems(items => [
      ...items,
      { id: `item-${Date.now()}`, date: today, description: "", rateType: "Per Hour", quantity: 1, unitPrice: 0 }
    ]);
  };
  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems(items => items.filter(i => i.id !== id));
  };
  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(items =>
      items.map(i => (i.id === id ? { ...i, [field]: value } : i))
    );
  };
  
  const calculateSubtotal = () =>
    lineItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0).toFixed(2);
  
  const calculateVAT = () => {
    if (!isVatRegistered) return "0.00";
    return (parseFloat(calculateSubtotal()) * 0.2).toFixed(2);
  };
  
  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const vat = parseFloat(calculateVAT());
    return (subtotal + vat).toFixed(2);
  };

  // Convert invoice data into a ShiftEntry (for timesheet sync)
  const getShiftData = (): ShiftEntry =>
    convertInvoiceToShift(customer, invoiceDate, reference, lineItems, customerEmail);

  // Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const handlePreview = () => setIsPreviewOpen(true);

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!sender) {
      toast({
        title: "Missing My Company Details",
        description: "Please save your company details first.",
        variant: "destructive"
      });
      return;
    }
    const payload = {
      customer,
      customerEmail,
      contactName,
      invoiceDate,
      reference,
      notes,
      terms,
      lineItems,
      address1: customerAddress1,
      address2: customerAddress2,
      city: customerCity,
      county: customerCounty,
      postcode: customerPostcode,
      country: customerCountry,
      subtotal: calculateSubtotal(),
      vat: calculateVAT(),
      total: calculateTotal(),
      isVatRegistered
    };
    try {
      const blob = await generateInvoicePDF(payload, sender);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${reference || Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded PDF", description: "Attach it in your email app." });
    } catch {
      toast({
        title: "Error Generating PDF",
        description: "Could not create invoice PDF.",
        variant: "destructive"
      });
    }
  };

  // SHARE Invoice (open mail immediately + download PDF in background)
  const handleShareInvoice = async () => {
    if (!sender) {
      toast({
        title: "Missing My Company Details",
        description: "Please save your company details first.",
        variant: "destructive"
      });
      return;
    }

    // Friendly email template
    const subject = encodeURIComponent(`Invoice #${reference} from ${sender.business_name}`);
    const body = encodeURIComponent(
`Hello ${customer},

Thank you for your business! Please find your invoice #${reference} dated ${invoiceDate.toLocaleDateString("en-GB")} attached.

If you have any questions, just reply to this email.

Best regards,
${sender.business_name}`
    );

    // 1) Open mail client right away
    window.open(`mailto:${customerEmail}?subject=${subject}&body=${body}`, "_blank");

    // 2) Generate & download PDF in the background
    try {
      const blob = await generateInvoicePDF(
        {
          customer,
          customerEmail,
          contactName,
          invoiceDate,
          reference,
          notes,
          terms,
          lineItems,
          address1: customerAddress1,
          address2: customerAddress2,
          city: customerCity,
          county: customerCounty,
          postcode: customerPostcode,
          country: customerCountry,
          subtotal: calculateSubtotal(),
          vat: calculateVAT(),
          total: calculateTotal(),
          isVatRegistered
        },
        sender
      );
      const fileName = `Invoice-${reference || Date.now()}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast({
        title: "Oops!",
        description: "Couldn't generate the invoice PDF.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="my-8" id="invoice-form">
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Invoice</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* FROM (My Company) */}
          {sender && (
            <Card className="mb-4">
              <CardContent className="pt-4">
                <h3 className="text-sm font-semibold mb-2">From</h3>
                <p>{sender.business_name}</p>
                {sender.contact_name && <p>{sender.contact_name}</p>}
                <p>{sender.address1}</p>
                {sender.address2 && <p>{sender.address2}</p>}
                <p>
                  {sender.city}
                  {sender.county ? `, ${sender.county}` : ""} {sender.postcode}
                </p>
                <p>{sender.country}</p>
              </CardContent>
            </Card>
          )}

          {/* VAT Settings */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="vat-registered"
                  checked={isVatRegistered}
                  onCheckedChange={setIsVatRegistered}
                />
                <Label htmlFor="vat-registered">Charge VAT (20%)</Label>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Toggle off if you're not VAT registered
              </p>
            </CardContent>
          </Card>

          {/* TABS */}
          <Tabs defaultValue="load-company" className="my-6">
            <TabsList>
              <TabsTrigger value="load-company">Load Company</TabsTrigger>
              <TabsTrigger value="my-company">My Company</TabsTrigger>
            </TabsList>
            <TabsContent value="load-company">
              <CompanySelector onSelect={handleCompanySelect} />
            </TabsContent>
            <TabsContent value="my-company">
              <MyCompanyForm />
            </TabsContent>
          </Tabs>

          {/* BILL TO / HEADER */}
          <InvoiceHeader
            customer={customer}
            setCustomer={setCustomer}
            customerEmail={customerEmail}
            setCustomerEmail={setCustomerEmail}
            contactName={contactName}
            setContactName={setContactName}
            invoiceDate={invoiceDate}
            setInvoiceDate={setInvoiceDate}
            reference={reference}
            setReference={setReference}
            address1={customerAddress1}
            setAddress1={setCustomerAddress1}
            address2={customerAddress2}
            setAddress2={setCustomerAddress2}
            city={customerCity}
            setCity={setCustomerCity}
            county={customerCounty}
            setCounty={setCustomerCounty}
            postcode={customerPostcode}
            setPostcode={setCustomerPostcode}
            country={customerCountry}
            setCountry={setCustomerCountry}
          />

          {/* LINE ITEMS */}
          <LineItemsTable
            lineItems={lineItems}
            updateLineItem={updateLineItem}
            removeLineItem={removeLineItem}
            addLineItem={addLineItem}
            calculateLineTotal={(q, p) => (q * p).toFixed(2)}
          />

          {/* NOTES & TERMS */}
          <NotesAndTerms notes={notes} setNotes={setNotes} terms={terms} setTerms={setTerms} />

          {/* SUMMARY */}
          <InvoiceSummary
            subtotal={calculateSubtotal()}
            vat={calculateVAT()}
            total={calculateTotal()}
            isVatRegistered={isVatRegistered}
          />
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3 justify-end">
          <Button variant="outline" onClick={handlePreview}>Preview</Button>
          <Button variant="outline" onClick={handleDownloadPDF}>Download PDF</Button>
          <Button onClick={handleShareInvoice}>Share Invoice</Button>
        </CardFooter>
      </Card>

      <PreviewInvoiceDialog
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        customer={customer}
        customerEmail={customerEmail}
        contactName={contactName}
        invoiceDate={invoiceDate}
        reference={reference}
        lineItems={lineItems}
        notes={notes}
        terms={terms}
        subtotal={calculateSubtotal()}
        vat={calculateVAT()}
        total={calculateTotal()}
        address1={customerAddress1}
        address2={customerAddress2}
        city={customerCity}
        county={customerCounty}
        postcode={customerPostcode}
        country={customerCountry}
        sender={sender}
        isVatRegistered={isVatRegistered}
      />
    </div>
  );
};

export default InvoiceForm;
