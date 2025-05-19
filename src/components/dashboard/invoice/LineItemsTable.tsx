
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LineItemRow from "./LineItemRow";
import { LineItem } from "./invoice-types";

interface LineItemsTableProps {
  lineItems: LineItem[];
  updateLineItem: (id: string, field: keyof LineItem, value: any) => void;
  removeLineItem: (id: string) => void;
  addLineItem: () => void;
  calculateLineTotal: (quantity: number, unitPrice: number) => string;
}

const LineItemsTable: React.FC<LineItemsTableProps> = ({
  lineItems,
  updateLineItem,
  removeLineItem,
  addLineItem,
  calculateLineTotal,
}) => {
  // Ensure lineItems is always an array, even if undefined is passed
  const safeLineItems = Array.isArray(lineItems) ? lineItems : [];
  
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead className="min-w-[200px]">Description</TableHead>
              <TableHead>Rate Type</TableHead>
              <TableHead>Hours Worked</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeLineItems.map((item) => (
              <LineItemRow
                key={item.id}
                item={item}
                updateLineItem={updateLineItem}
                removeLineItem={removeLineItem}
                isRemoveDisabled={safeLineItems.length === 1}
                calculateLineTotal={calculateLineTotal}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <Button variant="outline" onClick={addLineItem} className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" /> Add Line Item
      </Button>
    </div>
  );
};

export default LineItemsTable;
