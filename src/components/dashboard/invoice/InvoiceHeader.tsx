
import React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface InvoiceHeaderProps {
  customer: string;
  setCustomer: (value: string) => void;
  invoiceDate: Date;
  setInvoiceDate: (date: Date) => void;
  reference: string;
  setReference: (value: string) => void;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  customer,
  setCustomer,
  invoiceDate,
  setInvoiceDate,
  reference,
  setReference,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="customer">Customer</Label>
        <Input
          id="customer"
          placeholder="Select or enter customer name"
          className="w-full"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="invoiceDate">Invoice Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !invoiceDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {invoiceDate ? format(invoiceDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={invoiceDate}
                onSelect={(date) => date && setInvoiceDate(date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reference">Invoice Reference (Optional)</Label>
          <Input 
            id="reference" 
            placeholder="INV-001" 
            className="w-full"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;
