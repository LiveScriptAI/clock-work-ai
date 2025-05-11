
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { downloadCSV, downloadPDF } from "./export-utils";
import { ShiftEntry } from "./types";
import { toast } from "@/hooks/use-toast";

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
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExportCSV}
        disabled={isExporting !== null}
      >
        {isExporting === "csv" ? "Exporting..." : "Download CSV"}
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExportPDF}
        disabled={isExporting !== null}
      >
        {isExporting === "pdf" ? "Exporting..." : "Download PDF"}
      </Button>
    </div>
  );
};

export default ExportOptions;
