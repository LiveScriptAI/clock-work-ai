import { ShiftEntry } from "./types";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

// Helper to format a JS Date for CSV
const formatDate = (date: Date): string =>
  date.toLocaleString();

// — CSV Export —  
export function downloadCSV(shifts: ShiftEntry[]): void {
  if (shifts.length === 0) {
    toast.error("No shifts to export");
    return;
  }

  // Define your columns
  const headers = [
    "Date",
    "Employer Name",
    "Start Time",
    "End Time",
    "Total Hours Worked",
    "Pay Rate & Type",
    "Earnings",
    "Status",
  ];

  // Build rows
  const rows = shifts.map((s) => [
    formatDate(s.date),
    s.employer,
    formatDate(s.startTime),
    formatDate(s.endTime),
    `${s.hoursWorked.toFixed(2)}h`,
    `£${s.payRate} ${s.rateType}`,
    `£${s.earnings.toFixed(2)}`,
    s.status,
  ]);

  // CSV string
  const csvContent =
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  // Trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `timesheet-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success("CSV exported successfully");
}

// — PDF Export —
export function downloadPDF(shifts: ShiftEntry[]): void {
  if (shifts.length === 0) {
    toast.error("No shifts to export");
    return;
  }

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
    `£${s.payRate}/${s.rateType}`,
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

  doc.save(`timesheet-${new Date().toISOString().split("T")[0]}.pdf`);
  toast.success("PDF exported successfully");
}
