import React, { useState, useEffect, useCallback } from "react";
import { load } from "@/services/localStorageService";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import InvoiceHeader from "./InvoiceHeader";
import LineItemsTable from "./LineItemsTable";
import NotesAndTerms from "./NotesAndTerms";
import InvoiceSummary from "./InvoiceSummary";
import PreviewInvoiceDialog from "./PreviewInvoiceDialog";
import CompanySelector from "./CompanySelector";
import MyCompanyForm from "./MyCompanyForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InvoiceSettingsType } from "@/services/invoiceLocalService"; // or wherever your localStorageService types live
import { sendInvoice, generateInvoicePDF } from "./invoice-utils";
import { convertInvoiceToShift } from "./invoice-conversion-utils";
import { ShiftEntry } from "../timesheet/types";
import { LineItem } from "./invoice-types";

const InvoiceForm: React.FC = () => {
  const today = new Date();

  // — Invoice form fields —
  const [customer, setCustomer] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date>(today);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState(
    "Payment due within 30 days. Late payments are subject to a 2% monthly fee."
  );
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: `item-${Date.now()}`, date: today, description: "", rateType: "Per Hour", quantity: 1, unitPrice: 0 }
  ]);

  // — “My Company” (sender) data —
  const [sender, setSender] = useState<InvoiceSettingsType | null>(null);
  const [settingsVersion, setSettingsVersion] = useState(0);

  // Helper to reload company settings from localStorage
  const loadCompanySettings = useCallback(() => {
    const data = load<InvoiceSettingsType>("companySettings");
    if (data && data.business_name && data.address1) {
      setSender(data);
    } else {
      setSender(null);
    }
  }, []);

  // On mount and whenever MyCompanyForm tells us it’s saved, reload
  useEffect(() => {
    loadCompanySettings();
  }, [loadCompanySettings, settingsVersion]);

  // Called by MyCompanyForm after it successfully saves
  const handleSettingsSaved = () => {
    setSettingsVersion((v) => v + 1);
    toast({
      title: "My Company Updated",
      description: "Your ‘From’ section has been refreshed.",
    });
  };

  // — CompanySelector (for billing “To:” side) —
  const handleCompanySelect = (companyData: any) => {
    if (!companyData) return;
    setCustomer(companyData.company_name || "");
    setCustomerEmail(companyData.email || "");
    setReference((r) => r || `Invoice for ${companyData.company_name}`);
    toast({
      title: "Customer Loaded",
      description: `Now invoicing ${companyData.company_name}.`,
    });
  };

  // — Line‐item helpers —
  const addLineItem = () => {
    setLineItems((items) => [
      ...items,
      { id: `item-${Date.now()}`, date: today, description: "", rateType: "Per Hour", quantity: 1, unitPrice: 0 }
    ]);
  };
  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems((items) => items.filter((i) => i.id !== id));
  };
  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems((items) =>
      items.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };
  const calculateSubtotal = () =>
    lineItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0).toFixed(2);
  const calculateVAT = () => (parseFloat(calculateSubtotal()) * 0.2).toFixed(2);
  const calculateTotal = () =>
    (parseFloat(calculateSubtotal()) + parseFloat(calculateVAT())).toFixed(2);

  // Convert invoice data into a ShiftEntry if you’re also recording it
  const getShiftData = (): ShiftEntry =>
    convertInvoiceToShift(customer, invoiceDate, reference, lineItems, customerEmail);

  // — Preview Modal —
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const handlePreview = () => setIsPreviewOpen(true);

  // — Download PDF handler with improved guard & toast copy —
  const handleDownloadPDF = async () => {
    if (!sender) {
      toast({
        title: "Missing My Company Details",
        description: "Please save your company details in the My Company tab before downloading.",
        variant: "destructive"
      });
      return;
    }

    const payload = {
      customer,
      customerEmail,
      invoiceDate,
      reference,
      notes,
      terms,
      lineItems,
      address1: sender.address1,
      address2: sender.address2,
      city: sender.city,
      county: sender.county,
      postcode: sender.postcode,
      country: sender.country,
      subtotal: calculateSubtotal(),
      vat: calculateVAT(),
      total: calculateTotal()
    };

    try {
      const blob = await generateInvoicePDF(payload, sender);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${reference || Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded", description: "Invoice PDF is ready." });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error Generating PDF",
        description: "Something went wrong creating your invoice PDF.",
        variant: "destructive"
      });
    }
  };

  // — Email / Send Invoice handler with the same guard —
  const handleSendInvoice = () => {
    if (!sender) {
      toast({
        title: "Missing My Company Details",
        description: "Please save your company details in the My Company tab before sending.",
        variant: "destructive"
      });
      return;
    }

    const invoiceData = {
      customer,
      customerEmail,
      invoiceDate,
      reference,
      notes,
      terms,
      lineItems,
      address1: sender.address1,
      address2: sender.address2,
      city: sender.city,
      county: sender.county,
      postcode: sender.postcode,
      country: sender.country,
      subtotal: calculateSubtotal(),
      vat: calculateVAT(),
      total: calculateTotal()
    };

    sendInvoice(invoiceData);
  };

  return (
    <div className="my-8" id="invoice-form">
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Invoice</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* — FROM (My Company) */}
          {sender && (
            <Card className="mb-4">
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
            </Card>
          )}

          {/* — TABS: pick an existing customer or edit My Company */}
          <Tabs defaultValue="load-company" className="my-6">
            <TabsList>
              <TabsTrigger value="load-company">Load Company</TabsTrigger>
              <TabsTrigger value="my-company">My Company</TabsTrigger>
            </TabsList>

            <TabsContent value="load-company">
              <CompanySelector onSelect={handleCompanySelect} />
            </TabsContent>

            <TabsContent value="my-company">
              <MyCompanyForm onSettingsSaved={handleSettingsSaved} />
            </TabsContent>
          </Tabs>

          {/* — BILL TO / INVOICE HEADER */}
          <InvoiceHeader
            customer={customer}
            setCustomer={setCustomer}
            customerEmail={customerEmail}
            setCustomerEmail={setCustomerEmail}
            invoiceDate={invoiceDate}
            setInvoiceDate={setInvoiceDate}
            reference={reference}
            setReference={setReference}
            address1={sender?.address1 || ""}
            setAddress1={() => {}}
            address2={sender?.address2 || ""}
            setAddress2={() => {}}
            city={sender?.city || ""}
            setCity={() => {}}
            county={sender?.county || ""}
            setCounty={() => {}}
            postcode={sender?.postcode || ""}
            setPostcode={() => {}}
            country={sender?.country || ""}
            setCountry={() => {}}
          />

          {/* — LINE ITEMS */}
          <LineItemsTable
            lineItems={lineItems}
            updateLineItem={updateLineItem}
            removeLineItem={removeLineItem}
            addLineItem={addLineItem}
            calculateLineTotal={(q, p) => (q * p).toFixed(2)}
          />

          {/* — NOTES & TERMS */}
          <NotesAndTerms notes={notes} setNotes={setNotes} terms={terms} setTerms={setTerms} />

          {/* — SUMMARY */}
          <InvoiceSummary
            subtotal={calculateSubtotal()}
            vat={calculateVAT()}
            total={calculateTotal()}
          />
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3 justify-end">
          <Button variant="outline" onClick={handlePreview}>Preview</Button>
          <Button variant="outline" onClick={handleDownloadPDF}>Download PDF</Button>
          <Button onClick={handleSendInvoice}>Email Invoice</Button>
        </CardFooter>
      </Card>

      <PreviewInvoiceDialog
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        customer={customer}
        customerEmail={customerEmail}
        invoiceDate={invoiceDate}
        reference={reference}
        lineItems={lineItems}
        notes={notes}
        terms={terms}
        subtotal={calculateSubtotal()}
        vat={calculateVAT()}
        total={calculateTotal()}
        address1={sender?.address1}
        address2={sender?.address2}
        city={sender?.city}
        county={sender?.county}
        postcode={sender?.postcode}
        country={sender?.country}
        sender={sender}
      />
    </div>
  );
};

export default InvoiceForm;
