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
import { InvoiceSettingsType } from "@/services/invoiceLocalService";
import { generateInvoicePDF } from "./invoice-utils";
import { LineItem } from "./invoice-types";

const InvoiceForm: React.FC = () => {
  const today = new Date();

  // Invoice form state
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

  // “My Company” (sender) data
  const [sender, setSender] = useState<InvoiceSettingsType | null>(null);
  const [settingsVersion, setSettingsVersion] = useState(0);

  // Load company settings from localStorage
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

  // Called by MyCompanyForm on successful save
  const handleSettingsSaved = () => {
    setSettingsVersion((v) => v + 1);
    toast({ title: "My Company Updated", description: "Your ‘From’ section has been refreshed." });
  };

  // Customer selector
  const handleCompanySelect = (companyData: any) => {
    if (!companyData) return;
    setCustomer(companyData.company_name || "");
    setCustomerEmail(companyData.email || "");
    setReference((r) => r || `Invoice for ${companyData.company_name}`);
    toast({ title: "Customer Loaded", description: `Now invoicing ${companyData.company_name}.` });
  };

  // Line items helpers
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

  // Preview dialog
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const handlePreview = () => setIsPreviewOpen(true);

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!sender) {
      toast({
        title: "Missing My Company Details",
        description: "Please save your company info in the My Company tab first.",
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
      toast({ title: "Downloaded PDF", description: "Attach it to your email manually." });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error Generating PDF",
        description: "Something went wrong creating your invoice PDF.",
        variant: "destructive"
      });
    }
  };

  // Share via Web Share API or fallback to download
  const handleShareInvoice = async () => {
    if (!sender) {
      toast({
        title: "Missing My Company Details",
        description: "Please save your company info in the My Company tab first.",
        variant: "destructive",
      });
      return;
    }

    // generate PDF
    let pdfBlob: Blob;
    try {
      pdfBlob = await generateInvoicePDF(
        {
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
          total: calculateTotal(),
        },
        sender
      );
    } catch {
      toast({
        title: "Error generating PDF",
        description: "Couldn't build your invoice PDF.",
        variant: "destructive",
      });
      return;
    }

    const fileName = `Invoice-${reference || Date.now()}.pdf`;
    const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

    // Web Share API
    if (navigator.canShare?.({ files: [pdfFile] })) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: `Invoice ${reference}`,
          text: `Please find attached invoice ${reference}.`,
        });
        toast({ title: "Shared!", description: "Choose your mail app to send it." });
        return;
      } catch {
        // user cancelled or failed; fall back
      }
    }

    // fallback download
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded PDF", description: "Attach it to your email manually." });
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

          {/* TABS: pick existing customer or edit My Company */}
          <Tabs defaultValue="load-company" className="my-6">
            <TabsList>
              <TabsTrigger value="load-company">Load Company</TabsTrigger>
              <TabsTrigger value="my-company">My Company</TabsTrigger>
            </TabsList>

            <TabsContent value="load-company">
              <CompanySelector onSelect={handleCompanySelect} />
            </TabsContent>

            <TabsContent value="my-company">
              <MyCompanyForm onS
