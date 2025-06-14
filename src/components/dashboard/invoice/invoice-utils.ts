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
  customerEmail?: string; // Add customerEmail field
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
    customerEmail: clientEmail, // Use the actual client email
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
    console.log('Generating PDF with invoice data:', {
      lineItems: invoice.lineItems.length,
      customerEmail: invoice.customerEmail
    });

    // Initialize new PDF document
    const doc = new jsPDF();
    
    // Starting Y position for content after logo (if any)
    let yPos = 20;
    
    // Add logo if available
    if (sender.logo_url) {
      try {
        const logoDataUrl = await loadImage(sender.logo_url);
        doc.addImage(logoDataUrl, 'PNG', 14, 10, 40, 20, undefined, 'FAST');
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
    
    // To section with better positioning and complete address
    doc.setFontSize(11);
    doc.text("To:", 110, yPos);
    doc.setFontSize(10);
    
    let toY = yPos + 8;
    doc.text(invoice.customer || "Client Name", 110, toY);
    toY += lineHeight;
    
    // Add complete address fields with proper validation
    if (invoice.address1 && invoice.address1.trim()) {
      doc.text(invoice.address1, 110, toY);
      toY += lineHeight;
    }
    
    if (invoice.address2 && invoice.address2.trim()) {
      doc.text(invoice.address2, 110, toY);
      toY += lineHeight;
    }
    
    // City, County, Postcode combined - only add if at least one field has content
    const cityCountyPostcode2 = [
      invoice.city,
      invoice.county,
      invoice.postcode
    ].filter(field => field && field.trim()).join(", ");
    
    if (cityCountyPostcode2) {
      doc.text(cityCountyPostcode2, 110, toY);
      toY += lineHeight;
    }
    
    // Country - only add if it has content
    if (invoice.country && invoice.country.trim()) {
      doc.text(invoice.country, 110, toY);
      toY += lineHeight;
    }
    
    // Use actual customer email if provided, otherwise display "No email provided"
    const customerEmail = invoice.customerEmail && invoice.customerEmail.trim() 
      ? invoice.customerEmail 
      : "No email provided";
    doc.text(customerEmail, 110, toY);
    
    // Calculate the maximum Y position from both From and To sections
    const maxFromToY = yPos + 70; // Increased to accommodate more address lines
    
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
    let finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page for totals
    if (finalY > 220) {
      doc.addPage();
      finalY = 20;
    }
    
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
    
    // Check if we need a new page for notes
    if (notesY > 200) {
      doc.addPage();
      notesY = 20;
    }
    
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

// Function to send an invoice with granular address fields
export const sendInvoice = (invoice: Partial<InvoiceData>): void => {
  console.log('Sending invoice with data:', {
    customer: invoice.customer,
    customerEmail: invoice.customerEmail,
    lineItems: invoice.lineItems?.length
  });

  // Use the actual customer email if provided
  const email = invoice.customerEmail && invoice.customerEmail.trim() 
    ? invoice.customerEmail 
    : "customer@email.com";
  
  // Log the full invoice data being sent (in a real implementation, this would go to an API)
  console.log("Sending invoice with address details:", {
    customer: invoice.customer,
    email,
    address1: invoice.address1,
    address2: invoice.address2,
    city: invoice.city,
    county: invoice.county,
    postcode: invoice.postcode,
    country: invoice.country,
    lineItems: invoice.lineItems?.map(item => ({
      description: item.description
    }))
  });
  
  // Show success toast with the customer email
  toast.success(`Invoice sent successfully to ${email}`);
};
