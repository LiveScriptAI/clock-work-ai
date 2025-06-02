
export interface LineItem {
  id: string;
  date: Date | undefined;
  description: string;
  rateType: string;
  quantity: number;
  unitPrice: number;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string; // Data URL or blob URL
  uploadedAt: Date;
}

export interface InvoiceFormData {
  customer: string;
  customerEmail: string;
  invoiceDate: Date;
  reference: string;
  notes: string;
  terms: string;
  lineItems: LineItem[];
  address1: string;
  address2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
}
