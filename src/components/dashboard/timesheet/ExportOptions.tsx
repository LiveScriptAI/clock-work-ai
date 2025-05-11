
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { downloadCSV, downloadPDF } from "./export-utils";
import { ShiftEntry } from "./types";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface ExportOptionsProps {
  shifts: ShiftEntry[];
  className?: string;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ shifts, className }) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExportCSV = () => {
    if (isExporting) return; // Prevent multiple clicks
    
    setIsExporting("csv");
    
    try {
      downloadCSV(shifts);
      toast({
        title: "Export successful",
        description: "Your timesheet has been exported to CSV",
      });
    } catch (error) {
      console.error("CSV export error:", error);
      toast({
        title: "Export failed",
        description: "Could not export to CSV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPDF = () => {
    if (isExporting) return; // Prevent multiple clicks
    
    setIsExporting("pdf");
    
    try {
      downloadPDF(shifts);
      toast({
        title: "Export successful",
        description: "Your timesheet has been exported to PDF",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: "Could not export to PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className={`flex gap-2 ${className || ""}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            disabled={isExporting !== null}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <span>Export</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting !== null}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>CSV</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting !== null}>
            <FileText className="mr-2 h-4 w-4" />
            <span>PDF</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ExportOptions;
