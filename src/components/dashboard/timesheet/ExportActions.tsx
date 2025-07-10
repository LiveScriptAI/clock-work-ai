
import React from "react";
import { Button } from "@/components/ui/button";
import { downloadPDF } from "./export-utils";
import { ShiftEntry } from "./types";

interface ExportActionsProps {
  filteredShifts: ShiftEntry[];
  isLoading: boolean;
  isExporting: boolean;
  setIsExporting: (value: boolean) => void;
  importBreaksToExport?: boolean;
}

const ExportActions: React.FC<ExportActionsProps> = ({
  filteredShifts,
  isLoading,
  isExporting,
  setIsExporting,
  importBreaksToExport = false
}) => {
  // Debug logging
  console.log("ExportActions render:", {
    filteredShiftsCount: filteredShifts.length,
    isLoading,
    isExporting,
    importBreaksToExport
  });

  const handleExportPDF = async () => {
    console.log("handleExportPDF: Starting PDF export");
    console.log("Filtered shifts data:", filteredShifts);
    
    setIsExporting(true);
    try {
      // CRITICAL: Add data validation
      if (!filteredShifts || filteredShifts.length === 0) {
        console.warn("No shifts available for export");
        return;
      }
      
      await downloadPDF(filteredShifts);
      console.log("handleExportPDF: PDF export completed successfully");
    } catch (error) {
      console.error("handleExportPDF: PDF export failed", error);
      // Show user-friendly error
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate if buttons should be disabled
  const buttonsDisabled = isLoading || isExporting || filteredShifts.length === 0;
  
  console.log("ExportActions buttons disabled:", buttonsDisabled, {
    isLoading,
    isExporting,
    noShifts: filteredShifts.length === 0
  });

  return (
    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={buttonsDisabled}
        className="w-full sm:w-auto"
      >
        {isExporting ? 'Exporting...' : 'Download PDF'}
      </Button>
    </div>
  );
};

export default ExportActions;
