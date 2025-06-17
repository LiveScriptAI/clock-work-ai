
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { exportToPDF, exportToCSV } from "./export-utils";
import { Shift } from "./types";

interface ExportActionsProps {
  shifts: Shift[];
  selectedShifts: string[];
  companyName?: string;
  startDate?: Date;
  endDate?: Date;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  shifts,
  selectedShifts,
  companyName = "Company",
  startDate,
  endDate,
}) => {
  const { t } = useTranslation();

  const filteredShifts = shifts.filter(shift => 
    selectedShifts.length === 0 || selectedShifts.includes(shift.id)
  );

  const handlePDFExport = () => {
    exportToPDF(filteredShifts, companyName, startDate, endDate);
  };

  const handleCSVExport = () => {
    exportToCSV(filteredShifts, companyName);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        onClick={handlePDFExport}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        {t('Export PDF')}
      </Button>
      
      <Button
        onClick={handleCSVExport}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        {t('Export CSV')}
      </Button>
    </div>
  );
};
