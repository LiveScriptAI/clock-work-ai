import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { formatHoursAndMinutes } from "@/components/dashboard/utils";
import { InvoiceSettingsType } from "@/services/invoiceSettingsService";

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

export const downloadInvoicePDF = async (invoice: InvoiceData, sender: InvoiceSettingsType, includeBreaks: boolean = false): Promise<void> => {
  try {
    // Initialize new PDF document
    const doc = new jsPDF();
    
    // Starting Y position for content after logo (if any)
    let yPos = 15; // Default position
    
    // Add logo if available
    if (sender.logo_url) {
      try {
        const logoDataUrl = await loadImage(sender.logo_url);
        // Add the logo to the top left
        doc.addImage(logoDataUrl, 'PNG', 14, 10, 40, 20, undefined, 'FAST');
        // Adjust yPos to place content below the logo
        yPos = 40;
      } catch (err) {
        console.error('Error adding logo to PDF:', err);
      }
    }
    
    // Add title and invoice number
    doc.setFontSize(20);
    doc.text("INVOICE", 14, yPos);
    
    doc.setFontSize(10);
    doc.text(`Reference: ${invoice.reference || "N/A"}`, 14, yPos + 7);
    
    // Add date
    const formattedDate = invoice.invoiceDate.toLocaleDateString();
    doc.text(`Date: ${formattedDate}`, 170, yPos, { align: "right" });
    
    // Due date (30 days from invoice date)
    const dueDate = new Date(invoice.invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);
    doc.text(`Due: ${dueDate.toLocaleDateString()}`, 170, yPos + 7, { align: "right" });
    
    // From section with sender information
    doc.setFontSize(11);
    doc.text("From:", 14, yPos + 20);
    doc.setFontSize(10);
    
    // Use sender information instead of hardcoded values
    let senderY = yPos + 27;
    const lineHeight = 7;
    
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
    
    // To section
    doc.setFontSize(11);
    doc.text("To:", 110, yPos + 20);
    doc.setFontSize(10);
    doc.text(invoice.customer || "Client Name", 110, yPos + 27);
    
    // Format the customer address using granular fields
    let currentY = yPos + 34;
    
    // Address line 1
    if (invoice.address1) {
      doc.text(invoice.address1, 110, currentY);
      currentY += 7;
    }
    
    // Address line 2
    if (invoice.address2) {
      doc.text(invoice.address2, 110, currentY);
      currentY += 7;
    }
    
    // City, County, Postcode combined
    const cityCountyPostcode2 = [
      invoice.city,
      invoice.county,
      invoice.postcode
    ].filter(Boolean).join(", ");
    
    if (cityCountyPostcode2) {
      doc.text(cityCountyPostcode2, 110, currentY);
      currentY += 7;
    }
    
    // Country
    if (invoice.country) {
      doc.text(invoice.country, 110, currentY);
      currentY += 7;
    }
    
    // Email (based on customer name)
    doc.text(invoice.customer ? `${invoice.customer.toLowerCase().replace(/\s/g, "")}@email.com` : "client@email.com", 110, currentY);
    
    // Line items table
    const tableData = invoice.lineItems.map(item => {
      const baseRow = [
        item.date ? item.date.toLocaleDateString() : "N/A",
        item.description || "N/A",
        item.rateType,
        formatHoursAndMinutes(item.quantity),
        `£${item.unitPrice.toFixed(2)}`,
        `£${(item.quantity * item.unitPrice).toFixed(2)}`
      ];
      
      // If includeBreaks is true, add break information to description
      if (includeBreaks) {
        baseRow[1] += "\n(Breaks: See attached timesheet)";
      }
      
      return baseRow;
    });
    
    // Adjust table starting position if we have a logo
    const tableStartY = sender.logo_url ? yPos + 60 : 65;
    
    autoTable(doc, {
      startY: tableStartY,
      head: [["Date", "Description", "Rate Type", "Hours Worked", "Unit Price", "Total"]],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [75, 85, 99], textColor: 255 }
    });
    
    // Get the y position after the table
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Add breaks section if enabled
    if (includeBreaks) {
      doc.setFontSize(11);
      doc.text("Break Intervals:", 14, finalY + 10);
      doc.setFontSize(9);
      doc.text("Break intervals would be detailed here for each line item", 14, finalY + 20);
    }
    
    // Totals (adjust position if breaks section was added)
    const totalsY = includeBreaks ? finalY + 35 : finalY;
    
    doc.setFontSize(10);
    doc.text("Subtotal:", 140, totalsY);
    doc.text(`£${invoice.subtotal}`, 170, totalsY, { align: "right" });
    
    doc.text("VAT (20%):", 140, totalsY + 7);
    doc.text(`£${invoice.vat}`, 170, totalsY + 7, { align: "right" });
    
    doc.setFontSize(11);
    doc.text("Total:", 140, totalsY + 14);
    doc.text(`£${invoice.total}`, 170, totalsY + 14, { align: "right" });
    
    // Notes and Terms
    let notesY = totalsY + 30;
    
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
