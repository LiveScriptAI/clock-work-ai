
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { formatHoursAndMinutes } from "@/components/dashboard/utils";

interface LineItem {
  id: string;
  date: Date | undefined;
  description: string;
  rateType: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceData {
  customer: string;
  invoiceDate: Date;
  reference: string;
  lineItems: LineItem[];
  notes: string;
  terms: string;
  subtotal: string;
  vat: string;
  total: string;
}

export const downloadInvoicePDF = (invoice: InvoiceData): void => {
  try {
    // Initialize new PDF document
    const doc = new jsPDF();
    
    // Add title and invoice number
    doc.setFontSize(20);
    doc.text("INVOICE", 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Reference: ${invoice.reference || "N/A"}`, 14, 22);
    
    // Add date
    const formattedDate = invoice.invoiceDate.toLocaleDateString();
    doc.text(`Date: ${formattedDate}`, 170, 15, { align: "right" });
    
    // Due date (30 days from invoice date)
    const dueDate = new Date(invoice.invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);
    doc.text(`Due: ${dueDate.toLocaleDateString()}`, 170, 22, { align: "right" });
    
    // From and To sections
    doc.setFontSize(11);
    doc.text("From:", 14, 35);
    doc.setFontSize(10);
    doc.text("Your Business Name", 14, 42);
    doc.text("Your Address", 14, 49);
    doc.text("your@email.com", 14, 56);
    
    doc.setFontSize(11);
    doc.text("To:", 110, 35);
    doc.setFontSize(10);
    doc.text(invoice.customer || "Client Name", 110, 42);
    doc.text("Client Address", 110, 49);
    doc.text(invoice.customer ? `${invoice.customer.toLowerCase().replace(/\s/g, "")}@email.com` : "client@email.com", 110, 56);
    
    // Line items table
    const tableData = invoice.lineItems.map(item => [
      item.date ? item.date.toLocaleDateString() : "N/A",
      item.description || "N/A",
      item.rateType,
      formatHoursAndMinutes(item.quantity),
      `£${item.unitPrice.toFixed(2)}`,
      `£${(item.quantity * item.unitPrice).toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: 65,
      head: [["Date", "Description", "Rate Type", "Hours Worked", "Unit Price", "Total"]],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [75, 85, 99], textColor: 255 }
    });
    
    // Get the y position after the table
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Totals
    doc.text("Subtotal:", 140, finalY);
    doc.text(`£${invoice.subtotal}`, 170, finalY, { align: "right" });
    
    doc.text("VAT (20%):", 140, finalY + 7);
    doc.text(`£${invoice.vat}`, 170, finalY + 7, { align: "right" });
    
    doc.setFontSize(11);
    doc.text("Total:", 140, finalY + 14);
    doc.text(`£${invoice.total}`, 170, finalY + 14, { align: "right" });
    
    // Notes and Terms
    let notesY = finalY + 30;
    
    if (invoice.notes) {
      doc.setFontSize(11);
      doc.text("Notes:", 14, notesY);
      doc.setFontSize(9);
      doc.text(invoice.notes, 14, notesY + 7, { maxWidth: 80 });
    }
    
    if (invoice.terms) {
      doc.setFontSize(11);
      doc.text("Terms & Conditions:", 110, notesY);
      doc.setFontSize(9);
      doc.text(invoice.terms, 110, notesY + 7, { maxWidth: 80 });
    }
    
    // Save the PDF
    const filename = `invoice-${invoice.reference || "draft"}-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
    
    toast.success("Invoice PDF created successfully");
  } catch (error) {
    console.error("PDF export failed:", error);
    toast.error("Failed to generate invoice PDF");
  }
};

// Function to send an invoice (placeholder)
export const sendInvoice = (customerEmail: string): void => {
  // This is just a placeholder function that would normally connect to a backend
  const email = customerEmail || "customer@email.com";
  
  // Show success toast with the customer email
  toast.success(`Invoice sent successfully to ${email}`);
};
