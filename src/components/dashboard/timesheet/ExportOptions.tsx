
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FilePdf, FileSpreadsheet, Loader2 } from "lucide-react";
import { downloadCSV, downloadPDF } from "./export-utils";
import { ShiftEntry } from "./types";
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
    setIsExporting("csv");
    
    // Small timeout to allow UI to update before potentially heavy operation
    setTimeout(() => {
      try {
        downloadCSV(shifts);
      } finally {
        setIsExporting(null);
      }
    }, 100);
  };

  const handleExportPDF = () => {
    setIsExporting("pdf");
    
    // Small timeout to allow UI to update before potentially heavy operation
    setTimeout(() => {
      try {
        downloadPDF(shifts);
      } finally {
        setIsExporting(null);
      }
    }, 100);
  };

  return (
    <div className={`flex gap-2 ${className || ""}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
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
            <FilePdf className="mr-2 h-4 w-4" />
            <span>PDF</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ExportOptions;
