
import React from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatHoursAndMinutes } from "@/components/dashboard/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface LineItem {
  id: string;
  date: Date | undefined;
  description: string;
  rateType: string;
  quantity: number;
  unitPrice: number;
}

interface PreviewInvoiceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customer: string;
  invoiceDate: Date;
  reference: string;
  lineItems: LineItem[];
  notes: string;
  terms: string;
  subtotal: string;
  vat: string;
  total: string;
  // New address fields
  address1: string;
  address2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
}

const PreviewInvoiceDialog = ({
  isOpen,
  onOpenChange,
  customer,
  invoiceDate,
  reference,
  lineItems,
  notes,
  terms,
  subtotal,
  vat,
  total,
  // New address fields
  address1,
  address2,
  city,
  county,
  postcode,
  country,
}: PreviewInvoiceDialogProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[90vw] max-h-[90vh] overflow-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
        </DialogHeader>
        
        <div className="flex-grow overflow-auto max-h-[80vh]">
          <div className="space-y-6 pb-6 px-1">
            {/* Invoice Header */}
            <div className="border-b pb-4">
              <div className="flex justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-bold">INVOICE</h3>
                  <p className="text-muted-foreground">Reference: {reference || "N/A"}</p>
                </div>
                <div className="text-right">
                  <p><span className="font-medium">Date:</span> {format(invoiceDate, "dd MMM yyyy")}</p>
                  <p className="text-muted-foreground">Due: {format(new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000), "dd MMM yyyy")}</p>
                </div>
              </div>
            </div>

            {/* From/To Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b pb-4">
              <div>
                <h4 className="font-semibold mb-2">From</h4>
                <p>Your Business Name</p>
                <p>Your Address</p>
                <p>your@email.com</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">To</h4>
                <p>{customer || "Client Name"}</p>
                {/* Display formatted address using the new props */}
                {address1 && <p>{address1}</p>}
                {address2 && <p>{address2}</p>}
                <p>
                  {[
                    city,
                    county,
                    postcode
                  ].filter(Boolean).join(", ")}
                </p>
                {country && <p>{country}</p>}
                <p>{customer ? `${customer.toLowerCase().replace(/\s/g, "")}@email.com` : "client@email.com"}</p>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <h4 className="font-semibold mb-4">Invoice Items</h4>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="hidden sm:table-cell">Rate Type</TableHead>
                      <TableHead>Hours Worked</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.date ? format(item.date, "dd/MM/yyyy") : "N/A"}</TableCell>
                        <TableCell>{item.description || "N/A"}</TableCell>
                        <TableCell className="hidden sm:table-cell">{item.rateType}</TableCell>
                        <TableCell>{formatHoursAndMinutes(item.quantity)}</TableCell>
                        <TableCell>£{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>£{(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>£{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT (20%):</span>
                  <span>£{vat}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>£{total}</span>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {(notes || terms) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t pt-4">
                {notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notes}</p>
                  </div>
                )}
                {terms && (
                  <div>
                    <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{terms}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewInvoiceDialog;
