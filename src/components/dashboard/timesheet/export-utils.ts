
import { ShiftEntry } from "./types";
import { sharePDF } from "@/services/pdfExportService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

// — PDF Export —
export async function downloadPDF(shifts: ShiftEntry[]): Promise<void> {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Timesheet Log", 14, 20);
  doc.setFontSize(10);
  doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 28);

  // Columns for the PDF table
  const head = [
    [
      "Date",
      "Employer",
      "Start",
      "End",
      "Hours",
      "Rate",
      "Earnings",
      "Status",
    ],
  ];

  const body = shifts.map((s) => [
    format(s.date, "yyyy-MM-dd"),
    s.employer,
    format(s.startTime, "HH:mm"),
    format(s.endTime, "HH:mm"),
    s.hoursWorked.toFixed(2),
    `£${s.payRate}/${s.payType}`,
    `£${s.earnings.toFixed(2)}`,
    s.status,
  ]);

  autoTable(doc, {
    head,
    body,
    startY: 35,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  // Generate PDF blob and share using Capacitor-compatible service
  const pdfBlob = doc.output('blob');
  const fileName = `timesheet-${new Date().toISOString().split("T")[0]}.pdf`;
  
  await sharePDF({ fileName, pdfBlob });
}
