
import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Trash2 } from "lucide-react";
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
import { LineItem, FileAttachment } from "./invoice-types";
import { formatHoursAndMinutes } from "@/components/dashboard/utils";
import FileUploadButton from "./FileUploadButton";
import { toast } from "sonner";

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
  const [viewingAttachment, setViewingAttachment] = useState<FileAttachment | null>(null);

  const handleFileUpload = (file: File) => {
    console.log("File uploaded for line item:", item.id, file);
    
    // Create file reader to convert file to data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileAttachment: FileAttachment = {
        id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: e.target?.result as string,
        uploadedAt: new Date()
      };

      // Add attachment to line item
      const currentAttachments = item.attachments || [];
      const updatedAttachments = [...currentAttachments, fileAttachment];
      updateLineItem(item.id, "attachments", updatedAttachments);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    const currentAttachments = item.attachments || [];
    const updatedAttachments = currentAttachments.filter(att => att.id !== attachmentId);
    updateLineItem(item.id, "attachments", updatedAttachments);
    toast.success("Attachment removed");
  };

  const handleViewAttachment = (attachment: FileAttachment) => {
    if (attachment.type.startsWith('image/')) {
      // For images, we can show them in a modal or open in new tab
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${attachment.name}</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
              <img src="${attachment.url}" style="max-width:100%;max-height:100%;object-fit:contain;" alt="${attachment.name}" />
            </body>
          </html>
        `);
      }
    } else {
      // For other files, download them
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      link.click();
    }
  };

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
        <FileUploadButton 
          onFileSelect={handleFileUpload}
          attachments={item.attachments}
          onRemoveAttachment={handleRemoveAttachment}
          onViewAttachment={handleViewAttachment}
        />
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
