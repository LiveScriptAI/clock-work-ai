
import React from "react";
import { Button } from "@/components/ui/button";
import { downloadCSV, downloadPDF } from "./export-utils";
import { ShiftEntry } from "./types";

interface ExportActionsProps {
  filteredShifts: ShiftEntry[];
  isLoading: boolean;
  isExporting: string | null;
  setIsExporting: (value: string | null) => void;
}

const ExportActions: React.FC<ExportActionsProps> = ({
  filteredShifts,
  isLoading,
  isExporting,
  setIsExporting
}) => {
  // Export handlers
  const handleExportCSV = () => {
    setIsExporting('csv');
    setTimeout(() => {
      downloadCSV(filteredShifts);
      setIsExporting(null);
    }, 500);
  };

  const handleExportPDF = () => {
    setIsExporting('pdf');
    setTimeout(() => {
      downloadPDF(filteredShifts);
      setIsExporting(null);
    }, 500);
  };

  return (
    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        disabled={isLoading || isExporting !== null || filteredShifts.length === 0}
        className="w-full sm:w-auto"
      >
        {isExporting === 'csv' ? 'Exporting...' : 'Download CSV'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={isLoading || isExporting !== null || filteredShifts.length === 0}
        className="w-full sm:w-auto"
      >
        {isExporting === 'pdf' ? 'Exporting...' : 'Download PDF'}
      </Button>
    </div>
  );
};

export default ExportActions;
