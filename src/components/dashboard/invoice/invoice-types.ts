
import { ShiftEntry } from "@/components/dashboard/timesheet/types";

export interface LineItem {
  id: string;
  date: Date | undefined;
  description: string;
  rateType: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceData {
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

// Re-export ShiftEntry for convenience
export type { ShiftEntry };
