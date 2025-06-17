
import React from "react";
import { Button } from "@/components/ui/button";
import { downloadCSV, downloadPDF } from "./export-utils";
import { ShiftEntry } from "./types";

interface ExportActionsProps {
  filteredShifts: ShiftEntry[];
  isLoading: boolean;
  isExporting: string | null;
  setIsExporting: (value: string | null) => void;
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

  // Export handlers
  const handleExportCSV = () => {
    console.log("handleExportCSV: Starting CSV export");
    setIsExporting('csv');
    setTimeout(() => {
      downloadCSV(filteredShifts, importBreaksToExport);
      setIsExporting(null);
      console.log("handleExportCSV: CSV export completed");
    }, 500);
  };

  const handleExportPDF = () => {
    console.log("handleExportPDF: Starting PDF export");
    setIsExporting('pdf');
    setTimeout(() => {
      downloadPDF(filteredShifts, importBreaksToExport);
      setIsExporting(null);
      console.log("handleExportPDF: PDF export completed");
    }, 500);
  };

  // Calculate if buttons should be disabled
  const buttonsDisabled = isLoading || isExporting !== null || filteredShifts.length === 0;
  
  console.log("ExportActions buttons disabled:", buttonsDisabled, {
    isLoading,
    isExporting: isExporting !== null,
    noShifts: filteredShifts.length === 0
  });

  return (
    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        disabled={buttonsDisabled}
        className="w-full sm:w-auto"
      >
        {isExporting === 'csv' ? 'Exporting...' : 'Download CSV'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={buttonsDisabled}
        className="w-full sm:w-auto"
      >
        {isExporting === 'pdf' ? 'Exporting...' : 'Download PDF'}
      </Button>
    </div>
  );
};

export default ExportActions;
