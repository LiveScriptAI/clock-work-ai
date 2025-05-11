
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, File, Loader2 } from "lucide-react";
import { downloadCSV, downloadPDF } from "./export-utils";
import { ShiftEntry } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ExportOptionsProps {
  shifts: ShiftEntry[];
  className?: string;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ shifts, className }) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExportCSV = () => {
    setIsExporting("csv");
    
    // Small timeout to allow UI to update before potentially heavy operation
    setTimeout(() => {
      try {
        if (shifts.length === 0) {
          toast({
            title: "No data to export",
            description: "There are no shifts available to export.",
            variant: "destructive",
          });
        } else {
          downloadCSV(shifts);
          toast({
            title: "Export successful",
            description: "CSV file has been downloaded.",
          });
        }
      } catch (error) {
        console.error("CSV export error:", error);
        toast({
          title: "Export failed",
          description: "Failed to export CSV. Please try again.",
          variant: "destructive",
        });
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
        if (shifts.length === 0) {
          toast({
            title: "No data to export",
            description: "There are no shifts available to export.",
            variant: "destructive",
          });
          setIsExporting(null);
          return;
        }
        
        downloadPDF(shifts);
        toast({
          title: "Export successful",
          description: "PDF file has been downloaded.",
        });
      } catch (error) {
        console.error("PDF export error:", error);
        toast({
          title: "Export failed",
          description: "Failed to export PDF. Please try again.",
          variant: "destructive",
        });
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
            <File className="mr-2 h-4 w-4" />
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
