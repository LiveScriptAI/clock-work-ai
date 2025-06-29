import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { formatHoursAndMinutes } from "@/components/dashboard/utils";
import { InvoiceSettingsType } from "@/services/invoiceLocalService";
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
  customerEmail?: string;
  contactName?: string;
  invoiceDate: Date;
  reference: string;
  lineItems: LineItem[];
  notes: string;
  terms: string;
  subtotal: string;
  vat: string;
  total: string;
  address1: string;
  address2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
  isVatRegistered: boolean;
}

// Function to load an image from URL and return it as a data URL
const loadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
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
export const convertShiftToInvoice = (shift: ShiftEntry, clientEmail: string = '', contactName: string = ''): InvoiceData => {
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
    customerEmail: clientEmail,
    contactName: contactName,
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
    country: "",
    isVatRegistered: true
  };
};

// Generate PDF as Blob
export const generateInvoicePDF = async (invoice: InvoiceData, sender: InvoiceSettingsType): Promise<Blob> => {
  try {
    console.log('Generating PDF with invoice data:', {
      lineItems: invoice.lineItems.length,
      customerEmail: invoice.customerEmail,
      isVatRegistered: invoice.isVatRegistered
    });

    const doc = new jsPDF();
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
    
    // Add title and invoice number
    doc.setFontSize(20);
    doc.text("INVOICE", 14, yPos);
    
    doc.setFontSize(10);
    doc.text(`Reference: ${invoice.reference || "N/A"}`, 14, yPos + 8);
    
    // Add date
    const formattedDate = invoice.invoiceDate.toLocaleDateString();
    doc.text(`Date: ${formattedDate}`, 170, yPos, { align: "right" });
    
    // Due date (30 days from invoice date)
    const dueDate = new Date(invoice.invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);
    doc.text(`Due: ${dueDate.toLocaleDateString()}`, 170, yPos + 8, { align: "right" });
    
    yPos += 25;
    
    // From section
    doc.setFontSize(11);
    doc.text("From:", 14, yPos);
    doc.setFontSize(10);
    
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
    
    const cityCountyPostcode = [
      sender.city,
      sender.county,
      sender.postcode
    ].filter(Boolean).join(", ");
    
    if (cityCountyPostcode) {
      doc.text(cityCountyPostcode, 14, senderY);
      senderY += lineHeight;
    }
    
    if (sender.country) {
      doc.text(sender.country, 14, senderY);
    }
    
    // To section
    doc.setFontSize(11);
    doc.text("To:", 110, yPos);
    doc.setFontSize(10);
    
    let toY = yPos + 8;
    doc.text(invoice.customer || "Client Name", 110, toY);
    toY += lineHeight;
    
    // Add contact name if available
    if (invoice.contactName && invoice.contactName.trim()) {
      doc.text(`Contact: ${invoice.contactName}`, 110, toY);
      toY += lineHeight;
    }
    
    // Add address fields
    if (invoice.address1 && invoice.address1.trim()) {
      doc.text(invoice.address1, 110, toY);
      toY += lineHeight;
    }
    
    if (invoice.address2 && invoice.address2.trim()) {
      doc.text(invoice.address2, 110, toY);
      toY += lineHeight;
    }
    
    const cityCountyPostcode2 = [
      invoice.city,
      invoice.county,
      invoice.postcode
    ].filter(field => field && field.trim()).join(", ");
    
    if (cityCountyPostcode2) {
      doc.text(cityCountyPostcode2, 110, toY);
      toY += lineHeight;
    }
    
    if (invoice.country && invoice.country.trim()) {
      doc.text(invoice.country, 110, toY);
      toY += lineHeight;
    }
    
    const customerEmail = invoice.customerEmail && invoice.customerEmail.trim() 
      ? invoice.customerEmail 
      : "No email provided";
    doc.text(customerEmail, 110, toY);
    
    const maxFromToY = yPos + 70;
    
    // Line items table
    const tableData = invoice.lineItems.map(item => [
      item.date ? item.date.toLocaleDateString() : "N/A",
      item.description || "N/A",
      item.rateType,
      formatHoursAndMinutes(item.quantity),
      `£${item.unitPrice.toFixed(2)}`,
      `£${(item.quantity * item.unitPrice).toFixed(2)}`
    ]);
    
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
    
    let finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Totals section (right side)
    const totalsX = 140;
    const totalsValueX = 170;
    
    doc.setFontSize(10);
    doc.text("Subtotal:", totalsX, finalY);
    doc.text(`£${invoice.subtotal}`, totalsValueX, finalY, { align: "right" });
    
    // Only show VAT if registered
    if (invoice.isVatRegistered) {
      doc.text("VAT (20%):", totalsX, finalY + 7);
      doc.text(`£${invoice.vat}`, totalsValueX, finalY + 7, { align: "right" });
      finalY += 7;
    }
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("Total:", totalsX, finalY + 9);
    doc.text(`£${invoice.total}`, totalsValueX, finalY + 9, { align: "right" });
    doc.setFont(undefined, 'normal');
    
    // Calculate space for Terms & Conditions on first page
    let termsY = finalY + 25;
    const pageHeight = doc.internal.pageSize.height;
    const termsHeight = 40; // Estimate height needed for terms
    
    // Keep Terms & Conditions on first page if possible
    if (termsY + termsHeight > pageHeight - 20) {
      // If not enough space, place terms below totals but compact
      termsY = finalY + 20;
    }
    
    // Terms and Conditions (left side, aligned with left margin)
    if (invoice.terms && termsY + 30 < pageHeight) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text("Terms & Conditions:", 14, termsY);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      
      // Split terms into lines that fit within page width
      const termsLines = doc.splitTextToSize(invoice.terms, 180);
      let currentTermsY = termsY + 6;
      
      // Only show as many lines as fit on the page
      const maxLines = Math.floor((pageHeight - currentTermsY - 10) / 4);
      const displayLines = termsLines.slice(0, maxLines);
      
      displayLines.forEach((line: string) => {
        if (currentTermsY < pageHeight - 10) {
          doc.text(line, 14, currentTermsY);
          currentTermsY += 4;
        }
      });
    }
    
    // Notes (right side, if space available)
    if (invoice.notes && termsY + 30 < pageHeight) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text("Notes:", 110, termsY);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      
      const notesLines = doc.splitTextToSize(invoice.notes, 80);
      let currentNotesY = termsY + 6;
      
      const maxLines = Math.floor((pageHeight - currentNotesY - 10) / 4);
      const displayLines = notesLines.slice(0, maxLines);
      
      displayLines.forEach((line: string) => {
        if (currentNotesY < pageHeight - 10) {
          doc.text(line, 110, currentNotesY);
          currentNotesY += 4;
        }
      });
    }
    
    return doc.output('blob');
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw new Error("Failed to generate invoice PDF");
  }
};

// Function to send an invoice
export const sendInvoice = (invoice: Partial<InvoiceData>): void => {
  console.log('Sending invoice with data:', {
    customer: invoice.customer,
    customerEmail: invoice.customerEmail,
    contactName: invoice.contactName,
    lineItems: invoice.lineItems?.length
  });

  const email = invoice.customerEmail && invoice.customerEmail.trim() 
    ? invoice.customerEmail 
    : "customer@email.com";
  
  console.log("Sending invoice with address details:", {
    customer: invoice.customer,
    contactName: invoice.contactName,
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
  
  toast.success(`Invoice sent successfully to ${email}`);
};
