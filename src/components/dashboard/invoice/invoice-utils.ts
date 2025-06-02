
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { formatHoursAndMinutes } from "@/components/dashboard/utils";
import { InvoiceSettingsType } from "@/services/invoiceSettingsService";
import { ShiftEntry } from "@/components/dashboard/timesheet/types";

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
  // Add granular address fields
  address1: string;
  address2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
}

// Function to load an image from URL and return it as a data URL
const loadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // This helps with CORS issues
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      reject(new Error('Could not load image'));
    };
    
    img.src = url;
  });
};

// Convert ShiftEntry to InvoiceData
export const convertShiftToInvoice = (shift: ShiftEntry, clientEmail: string = ''): InvoiceData => {
  const lineItem: LineItem = {
    id: shift.id,
    date: shift.date,
    description: `Work performed for ${shift.employer}`,
    rateType: shift.payType,
    quantity: shift.hoursWorked,
    unitPrice: shift.payRate
  };

  const subtotal = shift.earnings;
  const vatAmount = subtotal * 0.2; // 20% VAT
  const total = subtotal + vatAmount;

  return {
    customer: shift.employer,
    invoiceDate: shift.date,
    reference: shift.id,
    lineItems: [lineItem],
    notes: "Thank you for your business",
    terms: "Payment due within 30 days",
    subtotal: subtotal.toFixed(2),
    vat: vatAmount.toFixed(2),
    total: total.toFixed(2),
    address1: "",
    address2: "",
    city: "",
    county: "",
    postcode: "",
    country: ""
  };
};

// Generate PDF as Blob
export const generateInvoicePDF = async (invoice: InvoiceData, sender: InvoiceSettingsType): Promise<Blob> => {
  try {
    // Initialize new PDF document
    const doc = new jsPDF();
    
    // Starting Y position for content after logo (if any)
    let yPos = 20;
    
    // Add logo if available
    if (sender.logo_url) {
      try {
        const logoDataUrl = await loadImage(sender.logo_url);
        // Add the logo to the top left with better positioning
        doc.addImage(logoDataUrl, 'PNG', 14, 10, 40, 20, undefined, 'FAST');
        // Adjust yPos to place content below the logo with more space
        yPos = 40;
      } catch (err) {
        console.error('Error adding logo to PDF:', err);
      }
    }
    
    // Add title and invoice number with better spacing
    doc.setFontSize(20);
    doc.text("INVOICE", 14, yPos);
    
    doc.setFontSize(10);
    doc.text(`Reference: ${invoice.reference || "N/A"}`, 14, yPos + 8);
    
    // Add date with better alignment
    const formattedDate = invoice.invoiceDate.toLocaleDateString();
    doc.text(`Date: ${formattedDate}`, 170, yPos, { align: "right" });
    
    // Due date (30 days from invoice date)
    const dueDate = new Date(invoice.invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);
    doc.text(`Due: ${dueDate.toLocaleDateString()}`, 170, yPos + 8, { align: "right" });
    
    // Increase spacing before From/To sections
    yPos += 25;
    
    // From section with sender information
    doc.setFontSize(11);
    doc.text("From:", 14, yPos);
    doc.setFontSize(10);
    
    // Use sender information with proper line spacing
    let senderY = yPos + 8;
    const lineHeight = 5;
    
    doc.text(sender.business_name, 14, senderY);
    senderY += lineHeight;
    
    doc.text(sender.address1, 14, senderY);
    senderY += lineHeight;
    
    if (sender.address2) {
      doc.text(sender.address2, 14, senderY);
      senderY += lineHeight;
    }
    
    // City, county and postcode
    const cityCountyPostcode = [
      sender.city,
      sender.county,
      sender.postcode
    ].filter(Boolean).join(", ");
    
    if (cityCountyPostcode) {
      doc.text(cityCountyPostcode, 14, senderY);
      senderY += lineHeight;
    }
    
    // Country
    if (sender.country) {
      doc.text(sender.country, 14, senderY);
    }
    
    // To section with better positioning
    doc.setFontSize(11);
    doc.text("To:", 110, yPos);
    doc.setFontSize(10);
    
    let toY = yPos + 8;
    doc.text(invoice.customer || "Client Name", 110, toY);
    toY += lineHeight;
    
    // Format the customer address using granular fields with proper spacing
    if (invoice.address1) {
      doc.text(invoice.address1, 110, toY);
      toY += lineHeight;
    }
    
    if (invoice.address2) {
      doc.text(invoice.address2, 110, toY);
      toY += lineHeight;
    }
    
    // City, County, Postcode combined
    const cityCountyPostcode2 = [
      invoice.city,
      invoice.county,
      invoice.postcode
    ].filter(Boolean).join(", ");
    
    if (cityCountyPostcode2) {
      doc.text(cityCountyPostcode2, 110, toY);
      toY += lineHeight;
    }
    
    // Country
    if (invoice.country) {
      doc.text(invoice.country, 110, toY);
      toY += lineHeight;
    }
    
    // Email (based on customer name)
    doc.text(invoice.customer ? `${invoice.customer.toLowerCase().replace(/\s/g, "")}@email.com` : "client@email.com", 110, toY);
    
    // Calculate the maximum Y position from both From and To sections
    const maxFromToY = Math.max(senderY, toY);
    
    // Line items table - ensure it starts well below the address sections
    const tableData = invoice.lineItems.map(item => [
      item.date ? item.date.toLocaleDateString() : "N/A",
      item.description || "N/A",
      item.rateType,
      formatHoursAndMinutes(item.quantity),
      `£${item.unitPrice.toFixed(2)}`,
      `£${(item.quantity * item.unitPrice).toFixed(2)}`
    ]);
    
    // Add extra spacing before table to prevent overlap
    const tableStartY = maxFromToY + 15;
    
    autoTable(doc, {
      startY: tableStartY,
      head: [["Date", "Description", "Rate Type", "Hours Worked", "Unit Price", "Total"]],
      body: tableData,
      theme: 'striped',
      styles: { 
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: { 
        fillColor: [75, 85, 99], 
        textColor: 255,
        fontStyle: 'bold'
      },
      margin: { left: 14, right: 14 }
    });
    
    // Get the y position after the table
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Totals section with better spacing
    const totalsX = 140;
    const totalsValueX = 170;
    
    doc.setFontSize(10);
    doc.text("Subtotal:", totalsX, finalY);
    doc.text(`£${invoice.subtotal}`, totalsValueX, finalY, { align: "right" });
    
    doc.text("VAT (20%):", totalsX, finalY + 7);
    doc.text(`£${invoice.vat}`, totalsValueX, finalY + 7, { align: "right" });
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("Total:", totalsX, finalY + 16);
    doc.text(`£${invoice.total}`, totalsValueX, finalY + 16, { align: "right" });
    doc.setFont(undefined, 'normal');
    
    // Notes and Terms with better spacing
    let notesY = finalY + 35;
    
    if (invoice.notes) {
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text("Notes:", 14, notesY);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(invoice.notes, 14, notesY + 7, { maxWidth: 80 });
    }
    
    if (invoice.terms) {
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text("Terms & Conditions:", 110, notesY);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(invoice.terms, 110, notesY + 7, { maxWidth: 80 });
    }
    
    // Return PDF as Blob instead of saving
    return doc.output('blob');
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw new Error("Failed to generate invoice PDF");
  }
};

// Keep existing downloadInvoicePDF function but refactor to use generateInvoicePDF
export const downloadInvoicePDF = async (invoice: InvoiceData, sender: InvoiceSettingsType): Promise<void> => {
  try {
    const pdfBlob = await generateInvoicePDF(invoice, sender);
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    const filename = `invoice-${invoice.reference || "draft"}-${new Date().toISOString().split("T")[0]}.pdf`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.display = "none";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast.success("Invoice PDF created successfully");
  } catch (error) {
    console.error("PDF export failed:", error);
    toast.error("Failed to generate invoice PDF");
  }
};

// Function to send an invoice with granular address fields
export const sendInvoice = (invoice: Partial<InvoiceData>): void => {
  // This is just a placeholder function that would normally connect to a backend
  const email = invoice.customer ? `${invoice.customer.toLowerCase().replace(/\s/g, "")}@email.com` : "customer@email.com";
  
  // Log the full invoice data being sent (in a real implementation, this would go to an API)
  console.log("Sending invoice with address details:", {
    customer: invoice.customer,
    email,
    address1: invoice.address1,
    address2: invoice.address2,
    city: invoice.city,
    county: invoice.county,
    postcode: invoice.postcode,
    country: invoice.country
  });
  
  // Show success toast with the customer email
  toast.success(`Invoice sent successfully to ${email}`);
};
