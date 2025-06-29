
export interface LineItem {
  id: string;
  date: Date | undefined;
  description: string;
  rateType: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceFormData {
  customer: string;
  customerEmail: string;
  contactName: string;
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
  isVatRegistered: boolean;
}
