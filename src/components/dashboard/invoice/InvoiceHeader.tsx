
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
  // Add email props
  customerEmail?: string;
  setCustomerEmail?: (value: string) => void;
  // Address props
  address1?: string;
  setAddress1?: (value: string) => void;
  address2?: string;
  setAddress2?: (value: string) => void;
  city?: string;
  setCity?: (value: string) => void;
  county?: string;
  setCounty?: (value: string) => void;
  postcode?: string;
  setPostcode?: (value: string) => void;
  country?: string;
  setCountry?: (value: string) => void;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  customer,
  setCustomer,
  invoiceDate,
  setInvoiceDate,
  reference,
  setReference,
  // Email fields
  customerEmail = "",
  setCustomerEmail = () => {},
  // Address fields
  address1 = "",
  setAddress1 = () => {},
  address2 = "",
  setAddress2 = () => {},
  city = "",
  setCity = () => {},
  county = "",
  setCounty = () => {},
  postcode = "",
  setPostcode = () => {},
  country = "",
  setCountry = () => {},
}) => {
  return (
    <div className="space-y-4 sm:space-y-6 p-4 bg-white rounded-md shadow-sm border-2 border-yellow-400">
      <h2 className="font-inter text-xl font-semibold text-gray-900">Create Invoice</h2>
      
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Customer Name Field - Full Width on Mobile */}
        <div className="space-y-2">
          <Label htmlFor="customer" className="text-sm font-medium">Customer</Label>
          <Input
            id="customer"
            placeholder="Select or enter customer name"
            className="w-full"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />
        </div>
        
        {/* Customer Email Field - Full Width on Mobile */}
        <div className="space-y-2">
          <Label htmlFor="customerEmail" className="text-sm font-medium">Customer Email</Label>
          <Input
            id="customerEmail"
            placeholder="Enter customer email"
            type="email"
            className="w-full"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="invoiceDate" className="text-sm font-medium">Invoice Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-10",
                  !invoiceDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {invoiceDate ? format(invoiceDate, "PPP") : "Pick a date"}
                </span>
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
          <Label htmlFor="reference" className="text-sm font-medium">Invoice Reference (Optional)</Label>
          <Input 
            id="reference" 
            placeholder="INV-001" 
            className="w-full"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
      </div>
      
      {/* Billing Address Section */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm sm:text-base">Billing Address</h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="address1" className="text-sm font-medium">Address Line 1</Label>
            <Input
              id="address1"
              placeholder="Address Line 1"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address2" className="text-sm font-medium">Address Line 2</Label>
            <Input
              id="address2" 
              placeholder="Address Line 2 (Optional)"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">City</Label>
              <Input
                id="city"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="county" className="text-sm font-medium">County/State</Label>
              <Input
                id="county"
                placeholder="County/State"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="postcode" className="text-sm font-medium">Postcode/ZIP</Label>
              <Input
                id="postcode"
                placeholder="Postcode/ZIP"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">Country</Label>
              <Input
                id="country"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;
