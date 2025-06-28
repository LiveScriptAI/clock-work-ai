import React, { useState, useEffect, useCallback } from "react";
import { load } from "@/services/localStorageService";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InvoiceHeader from "./InvoiceHeader";
import LineItemsTable from "./LineItemsTable";
import NotesAndTerms from "./NotesAndTerms";
import InvoiceSummary from "./InvoiceSummary";
import PreviewInvoiceDialog from "./PreviewInvoiceDialog";
import InvoiceActions from "./InvoiceActions";
import CompanySelector from "./CompanySelector";
import MyCompanyForm from "./MyCompanyForm";  // now accepts onSettingsSaved prop
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InvoiceSettingsType } from "@/services/invoiceLocalService";
import { ShiftEntry } from "../timesheet/types";
import { LineItem } from "./invoice-types";
import { toast } from "@/hooks/use-toast";
import { sendInvoice, generateInvoicePDF } from "./invoice-utils";
import { convertInvoiceToShift } from "./invoice-conversion-utils";

const InvoiceForm: React.FC = () => {
  const { user } = useAuth();
  const today = new Date();

  // --- Invoice form state ---
  const [customer, setCustomer] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [invoiceDate, setInvoiceDate] = useState<Date>(today);
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [terms, setTerms] = useState<string>(
    "Payment due within 30 days. Late payments are subject to a 2% monthly fee."
  );
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: `item-${Date.now()}`, date: today, description: "", rateType: "Per Hour", quantity: 1, unitPrice: 0 }
  ]);

  // --- “From” (sender) info loaded from MyCompanyForm ---
  const [sender, setSender] = useState<InvoiceSettingsType | null>(null);
  const [settingsVersion, setSettingsVersion] = useState<number>(0);

  // Helper to reload company settings
  const loadCompanySettings = useCallback(() => {
    const data = load<InvoiceSettingsType>("companySettings");
    if (data) {
      setSender(data);
    }
  }, []);

  // On mount & whenever settingsVersion changes, reload “From” info
  useEffect(() => {
    loadCompanySettings();
  }, [loadCompanySettings, settingsVersion]);

  // Called by MyCompanyForm after it successfully saves
  const handleSettingsSaved = () => {
    setSettingsVersion((v) => v + 1);
    toast({ title: "Company Info Updated", description: "Your ‘From’ section has been refreshed." });
  };

  // --- CompanySelector (for loading a customer) ---
  const handleCompanySelect = (companyData: any) => {
    if (!companyData) return;
    setCustomer(companyData.company_name || "");
    setCustomerEmail(companyData.email || "");
    setReference((r) => (r || `Invoice for ${companyData.company_name}`));
    toast({ title: "Customer Loaded", description: `Now invoicing ${companyData.company_name}` });
  };

  // --- Line items helpers ---
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

  // Convert to ShiftEntry for InvoiceActions
  const getShiftData = (): ShiftEntry =>
    convertInvoiceToShift(customer, invoiceDate, reference, lineItems, customerEmail);

  // --- Actions: preview, download, send ---
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const handlePreview = () => setIsPreviewOpen(true);

  const handleDownloadPDF = async () => {
    if (!sender) {
      toast({ title: "Missing company info", description: "Please fill out My Company first", variant: "destructive" });
      return;
    }
    const payload = { customer, customerEmail, invoiceDate, reference, notes, terms, lineItems, address1: sender.address1, address2: sender.address2, city: sender.city, county: sender.county, postcode: sender.postcode, country: sender.country, subtotal: calculateSubtotal(), vat: calculateVAT(), total: calculateTotal() };
    try {
      const blob = await generateInvoicePDF(payload, sender);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${reference || Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded", description: "Invoice PDF ready" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "PDF generation failed", variant: "destructive" });
    }
  };

  const handleSendInvoice = () => {
    const payload = { customer, customerEmail, invoiceDate, reference, notes, terms, lineItems, address1: sender?.address1, address2: sender?.address2, city: sender?.city, county: sender?.county, postcode: sender?.postcode, country: sender?.country, subtotal: calculateSubtotal(), vat: calculateVAT(), total: calculateTotal() };
    sendInvoice(payload);
  };

  return (
    <div className="my-8" id="invoice-form">
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Invoice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* — From (my company) */}
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

          {/* — Tabs: load existing customer or edit My Company */}
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

          {/* — Invoice header (customer & billing address) */}
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

          {/* — Line items, notes, summary */}
          <LineItemsTable
            lineItems={lineItems}
            updateLineItem={updateLineItem}
            removeLineItem={removeLineItem}
            addLineItem={addLineItem}
            calculateLineTotal={(q, p) => (q * p).toFixed(2)}
          />
          <NotesAndTerms notes={notes} setNotes={setNotes} terms={terms} setTerms={setTerms} />
          <InvoiceSummary subtotal={calculateSubtotal()} vat={calculateVAT()} total={calculateTotal()} />
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3 justify-end">
          <Button variant="outline" onClick={handlePreview}>Preview</Button>
          <Button variant="outline" onClick={handleDownloadPDF}>Download PDF</Button>
          <InvoiceActions
            shift={getShiftData()}
            clientEmail={customerEmail}
            customer={customer}
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
          />
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
