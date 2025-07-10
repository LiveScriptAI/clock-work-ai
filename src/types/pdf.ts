export interface ShiftEntry {
  id: string;
  date: Date;
  employer: string;
  startTime: Date;
  endTime: Date;
  breakDuration: number; // minutes
  hoursWorked: number;
  earnings: number;
  payRate: number;
  payType: string;
  status: string;
  breakIntervals?: { start: string; end: string }[];
  clientEmail?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  tax?: number;
  total: number;
}