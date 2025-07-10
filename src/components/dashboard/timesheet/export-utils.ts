
import { ShiftEntry } from "./types";
import { sharePDF, validatePDFBlob } from "@/services/pdfExportService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// — PDF Export —
export async function downloadPDF(shifts: ShiftEntry[]): Promise<void> {
  console.log('downloadPDF called with shifts:', shifts?.length || 0);
  
  // Data validation
  if (!shifts || shifts.length === 0) {
    console.warn('No shifts provided for PDF generation');
    throw new Error('No timesheet data available for export');
  }

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Timesheet Log", 14, 20);
  doc.setFontSize(10);
  // CRITICAL: Use safe date formatting
  doc.text(`Exported on: ${new Date().toISOString().split('T')[0]}`, 14, 28);

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
    // CRITICAL: Use safe date formatting
    s.date instanceof Date ? s.date.toISOString().split('T')[0] : String(s.date),
    s.employer,
    // CRITICAL: Use safe time formatting
    s.startTime instanceof Date ? s.startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : String(s.startTime),
    s.endTime instanceof Date ? s.endTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : String(s.endTime),
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

  // Generate PDF blob and validate
  const pdfBlob = doc.output('blob');
  console.log('PDF blob generated, size:', pdfBlob.size);
  
  // CRITICAL: Validate PDF blob before sharing
  const validation = validatePDFBlob(pdfBlob);
  if (!validation.isValid) {
    console.warn('PDF validation issues:', validation.issues);
  }
  
  const fileName = `timesheet-${new Date().toISOString().split("T")[0]}.pdf`;
  
  await sharePDF({ fileName, pdfBlob });
}
