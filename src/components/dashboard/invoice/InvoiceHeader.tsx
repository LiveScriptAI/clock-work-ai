
import React, { useEffect } from "react";
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
import { useAuth } from "@/hooks/useAuth";

interface InvoiceHeaderProps {
  customer: string;
  setCustomer: (value: string) => void;
  invoiceDate: Date;
  setInvoiceDate: (date: Date) => void;
  reference: string;
  setReference: (value: string) => void;
  // Address props
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
  invoiceDate,
  setInvoiceDate,
  reference,
  setReference,
  // Address fields
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
  const { profile } = useAuth();
  
  // Populate address fields with user profile data if available
  useEffect(() => {
    if (profile) {
      if (profile.address1 && !address1) setAddress1(profile.address1);
      if (profile.address2 && !address2) setAddress2(profile.address2);
      if (profile.city && !city) setCity(profile.city);
      if (profile.county && !county) setCounty(profile.county);
      if (profile.postcode && !postcode) setPostcode(profile.postcode);
      if (profile.country && !country) setCountry(profile.country);
    }
  }, [profile, address1, address2, city, county, postcode, country, setAddress1, setAddress2, setCity, setCounty, setPostcode, setCountry]);

  return (
    <div className="space-y-6">
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
      
      {/* Billing Address Section */}
      <div className="space-y-2">
        <h3 className="font-medium">Billing Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="address1">Address Line 1</Label>
            <Input
              id="address1"
              placeholder="Address Line 1"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="address2">Address Line 2</Label>
            <Input
              id="address2" 
              placeholder="Address Line 2 (Optional)"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="county">County/State</Label>
            <Input
              id="county"
              placeholder="County/State"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="postcode">Postcode/ZIP</Label>
            <Input
              id="postcode"
              placeholder="Postcode/ZIP"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
          </div>
          <div>
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
    </div>
  );
};

export default InvoiceHeader;
