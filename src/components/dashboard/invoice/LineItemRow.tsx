
import React from "react";
import { format } from "date-fns";
import { CalendarIcon, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { TableCell, TableRow } from "@/components/ui/table";
import { LineItem } from "./invoice-types";
import { formatHoursAndMinutes } from "@/components/dashboard/utils";

interface LineItemRowProps {
  item: LineItem;
  updateLineItem: (id: string, field: keyof LineItem, value: any) => void;
  removeLineItem: (id: string) => void;
  isRemoveDisabled: boolean;
  calculateLineTotal: (quantity: number, unitPrice: number) => string;
}

const LineItemRow: React.FC<LineItemRowProps> = ({ 
  item, 
  updateLineItem, 
  removeLineItem, 
  isRemoveDisabled,
  calculateLineTotal 
}) => {
  return (
    <TableRow>
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
        <div className="px-2 py-1 bg-gray-50 rounded border border-gray-100 text-center">
          {formatHoursAndMinutes(item.quantity)}
        </div>
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
          disabled={isRemoveDisabled}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default LineItemRow;
