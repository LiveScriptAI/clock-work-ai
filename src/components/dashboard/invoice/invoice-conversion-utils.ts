
import { ShiftEntry } from "@/components/dashboard/timesheet/types";
import { LineItem } from "./invoice-types";

export const convertInvoiceToShift = (
  customer: string,
  invoiceDate: Date,
  reference: string,
  lineItems: LineItem[],
  customerEmail?: string
): ShiftEntry => {
  // Calculate totals from line items
  const totalHours = lineItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalEarnings = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  
  // Use the first line item's rate as the primary rate, or calculate average
  const avgRate = totalHours > 0 ? totalEarnings / totalHours : 0;
  
  // Create a shift-like object that works with InvoiceActions
  const shiftData: ShiftEntry = {
    id: reference || `invoice-${Date.now()}`,
    date: invoiceDate,
    employer: customer,
    hoursWorked: totalHours,
    payRate: avgRate,
    payType: lineItems[0]?.rateType || "Per Hour",
    earnings: totalEarnings,
    clientEmail: customerEmail || "",
    // Required fields for ShiftEntry
    startTime: new Date(invoiceDate.getTime()),
    endTime: new Date(invoiceDate.getTime() + (totalHours * 60 * 60 * 1000)),
    breakDuration: 0,
    managerStartName: "",
    managerEndName: "",
    managerStartSignature: "",
    managerEndSignature: "",
    userId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    rateType: lineItems[0]?.rateType || "Per Hour"
  };

  return shiftData;
};
