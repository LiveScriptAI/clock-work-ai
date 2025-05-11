
import { ShiftEntry } from "./types";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
// Import the autotable plugin
import 'jspdf-autotable';

// Extend the jsPDF type definition to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Helper to format date for display
const formatDate = (date: Date): string => {
  return format(date, "MMM dd, yyyy");
};

// Helper to format time for display
const formatTime = (date: Date): string => {
  return format(date, "hh:mm a");
};

// Convert minutes to hours and minutes format
const formatBreakDuration = (minutes: number): string => {
  return `${minutes} min`;
};

// Format earnings with currency symbol
const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

// Generate CSV data from shifts
export const generateCSV = (shifts: ShiftEntry[]): string => {
  // CSV header row
  const header = [
    "Date",
    "Employer",
    "Start Time",
    "End Time",
    "Break Duration",
    "Hours Worked",
    "Pay Rate",
    "Rate Type",
    "Earnings",
    "Status"
  ].join(",");
  
  // Format each shift as a CSV row
  const rows = shifts.map(shift => [
    formatDate(shift.date),
    `"${shift.employer}"`, // Quote employer name in case it contains commas
    formatTime(shift.startTime),
    formatTime(shift.endTime),
    formatBreakDuration(shift.breakDuration),
    `${shift.hoursWorked.toFixed(2)}h`,
    formatCurrency(shift.payRate),
    shift.payType,
    formatCurrency(shift.earnings),
    shift.status
  ].join(","));
  
  // Combine header and rows
  return [header, ...rows].join("\n");
};

// Download CSV file
export const downloadCSV = (shifts: ShiftEntry[]): void => {
  const csvData = generateCSV(shifts);
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  // Current date for the filename
  const today = format(new Date(), "yyyy-MM-dd");
  
  link.setAttribute("href", url);
  link.setAttribute("download", `timesheet_${today}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate and download PDF
export const downloadPDF = (shifts: ShiftEntry[]): void => {
  try {
    // Initialize jsPDF
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Timesheet Report", 14, 22);
    
    // Add generation date
    doc.setFontSize(11);
    doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy")}`, 14, 30);
    
    // Prepare table data
    const tableColumn = [
      "Date", 
      "Employer", 
      "Start", 
      "End", 
      "Break", 
      "Hours", 
      "Rate", 
      "Type", 
      "Earnings", 
      "Status"
    ];
    
    const tableRows = shifts.map(shift => [
      formatDate(shift.date),
      shift.employer,
      formatTime(shift.startTime),
      formatTime(shift.endTime),
      formatBreakDuration(shift.breakDuration),
      `${shift.hoursWorked.toFixed(2)}h`,
      `$${shift.payRate}`,
      shift.payType,
      formatCurrency(shift.earnings),
      shift.status
    ]);

    // Use autoTable method - this is key for fixing the issue
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'striped',
      headStyles: { fillColor: [100, 100, 100] },
      margin: { top: 40 },
    });
    
    // Save the PDF
    const today = format(new Date(), "yyyy-MM-dd");
    doc.save(`timesheet_${today}.pdf`);
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error; // Re-throw to handle in the UI
  }
};
