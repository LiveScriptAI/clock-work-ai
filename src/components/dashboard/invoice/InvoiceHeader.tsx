
import React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvoiceHeaderProps {
  customer: string;
  setCustomer: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  contactName: string;
  setContactName: (value: string) => void;
  invoiceDate: Date;
  setInvoiceDate: (date: Date) => void;
  reference: string;
  setReference: (value: string) => void;
  address1: string;
  setAddress1: (value: string) => void;
  address2: string;
  setAddress2: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  county: string;
  setCounty: (value: string) => void;
  postcode: string;
  setPostcode: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  customer,
  setCustomer,
  customerEmail,
  setCustomerEmail,
  contactName,
  setContactName,
  invoiceDate,
  setInvoiceDate,
  reference,
  setReference,
  address1,
  setAddress1,
  address2,
  setAddress2,
  city,
  setCity,
  county,
  setCounty,
  postcode,
  setPostcode,
  country,
  setCountry,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Bill To Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Bill To</h3>
        
        <div className="space-y-2">
          <Label htmlFor="customer">Company Name</Label>
          <Input
            id="customer"
            placeholder="Company name"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Name</Label>
          <Input
            id="contactName"
            placeholder="Contact person name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerEmail">Email</Label>
          <Input
            id="customerEmail"
            type="email"
            placeholder="customer@example.com"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address1">Address Line 1</Label>
          <Input
            id="address1"
            placeholder="Street address"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address2">Address Line 2</Label>
          <Input
            id="address2"
            placeholder="Apartment, suite, etc."
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="county">County/State</Label>
            <Input
              id="county"
              placeholder="County"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="postcode">Postcode/ZIP</Label>
            <Input
              id="postcode"
              placeholder="Postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Invoice Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Invoice Details</h3>
        
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
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={invoiceDate}
                onSelect={(date) => date && setInvoiceDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference">Reference</Label>
          <Input
            id="reference"
            placeholder="INV-001"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;
