
import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Upload } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LineItem {
  id: string;
  date: Date | undefined;
  description: string;
  rateType: string;
  quantity: number;
  unitPrice: number;
}

const InvoiceForm = () => {
  const today = new Date();
  const [invoiceDate, setInvoiceDate] = useState<Date>(today);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: `item-${Date.now()}`,
      date: today,
      description: "",
      rateType: "Per Hour",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: `item-${Date.now()}`,
        date: today,
        description: "",
        rateType: "Per Hour",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateLineTotal = (quantity: number, unitPrice: number) => {
    return (quantity * unitPrice).toFixed(2);
  };

  const calculateSubtotal = () => {
    return lineItems
      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      .toFixed(2);
  };

  const calculateVAT = () => {
    const subtotal = parseFloat(calculateSubtotal());
    return (subtotal * 0.20).toFixed(2); // Placeholder VAT rate of 20%
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const vat = parseFloat(calculateVAT());
    return (subtotal + vat).toFixed(2);
  };

  return (
    <div className="my-8">
      {/* INVOICE FORM SECTION */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Invoice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Input
                id="customer"
                placeholder="Select or enter customer name"
                className="w-full"
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
                <Input id="reference" placeholder="INV-001" className="w-full" />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-4">
            <Label>Line Items</Label>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead className="min-w-[200px]">Description</TableHead>
                    <TableHead>Rate Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !item.date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-1 h-3 w-3" />
                              {item.date ? format(item.date, "dd/MM/yyyy") : "Select"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={item.date}
                              onSelect={(date) => updateLineItem(item.id, "date", date)}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(item.id, "description", e.target.value)
                          }
                          placeholder="Item description"
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.rateType}
                          onValueChange={(value) =>
                            updateLineItem(item.id, "rateType", value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select rate type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Per Hour">Per Hour</SelectItem>
                            <SelectItem value="Per Day">Per Day</SelectItem>
                            <SelectItem value="Per Job">Per Job</SelectItem>
                            <SelectItem value="Per Week">Per Week</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity.toString()}
                          onChange={(e) =>
                            updateLineItem(
                              item.id,
                              "quantity",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          min="0"
                          step="0.01"
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="mr-1">£</span>
                          <Input
                            type="number"
                            value={item.unitPrice.toString()}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                "unitPrice",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0"
                            step="0.01"
                            className="w-24"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        £{calculateLineTotal(item.quantity, item.unitPrice)}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="w-full">
                          <Upload className="h-3 w-3 mr-1" />
                          Upload
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button variant="outline" onClick={addLineItem} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Line Item
            </Button>
          </div>

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes to the customer..."
                className="min-h-32"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                placeholder="Payment terms and conditions..."
                className="min-h-32"
                defaultValue="Payment due within 30 days. Late payments are subject to a 2% monthly fee."
              />
            </div>
          </div>

          {/* Financial Summary */}
          <div className="flex flex-col items-end space-y-2 pt-4">
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              <span className="text-gray-600 font-medium">Subtotal:</span>
              <span className="text-right">£{calculateSubtotal()}</span>
              
              <span className="text-gray-600 font-medium">VAT (20%):</span>
              <span className="text-right">£{calculateVAT()}</span>
              
              <span className="text-lg font-bold">Total:</span>
              <span className="text-lg font-bold text-right">£{calculateTotal()}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3 justify-end">
          <Button variant="outline" className="w-full sm:w-auto">Preview Invoice</Button>
          <Button variant="outline" className="w-full sm:w-auto">Download PDF</Button>
          <Button variant="default" className="w-full sm:w-auto">Send Invoice</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InvoiceForm;
