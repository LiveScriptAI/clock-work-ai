
import { ShiftEntry } from "./types";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Format date for CSV and PDF
const formatDate = (date: Date): string => {
  return date.toLocaleString();
};

// Function to download CSV file
export const downloadCSV = (shifts: ShiftEntry[]): void => {
  try {
    if (shifts.length === 0) {
      toast.error("No shifts to export");
      return;
    }

    // CSV Headers
    const headers = [
      "Date", 
      "Employer Name", 
      "Start Time", 
      "End Time", 
      "Break Duration", 
      "Total Hours Worked", 
      "Pay Rate and Type", 
      "Estimated Earnings", 
      "Payment Status"
    ];

    // Convert shift data to CSV rows
    const csvContent = shifts.map((shift) => {
      return [
        formatDate(shift.date),
        shift.employer,
        formatDate(shift.startTime),
        formatDate(shift.endTime),
        `${shift.breakDuration} mins`,
        `${shift.hoursWorked.toFixed(2)} hours`,
        `$${shift.payRate} ${shift.payType}`,
        `$${shift.earnings.toFixed(2)}`,
        shift.status
      ].join(",");
    });

    // Combine headers and rows
    const csv = [headers.join(","), ...csvContent].join("\n");
    
    // Create a Blob and download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger click
    const link = document.createElement("a");
    const filename = `timesheet-export-${new Date().toISOString().split("T")[0]}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.display = "none";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV exported successfully");
  } catch (error) {
    console.error("CSV export failed:", error);
    toast.error("Failed to export CSV");
  }
};

// Function to download PDF file
export const downloadPDF = (shifts: ShiftEntry[]): void => {
  try {
    if (shifts.length === 0) {
      toast.error("No shifts to export");
      return;
    }
    
    // Initialize new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("Timesheet Log", 14, 15);
    
    // Add export date
    doc.setFontSize(10);
    doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 22);
    
    // Prepare table data
    const tableData = shifts.map((shift) => [
      formatDate(shift.date),
      shift.employer,
      formatDate(shift.startTime),
      formatDate(shift.endTime),
      `${shift.breakDuration} mins`,
      `${shift.hoursWorked.toFixed(2)} hours`,
      `$${shift.payRate} ${shift.payType}`,
      `$${shift.earnings.toFixed(2)}`,
      shift.status
    ]);
    
    // Generate table
    autoTable(doc, {
      head: [[
        "Date", 
        "Employer", 
        "Start Time", 
        "End Time", 
        "Break", 
        "Hours", 
        "Rate", 
        "Earnings", 
        "Status"
      ]],
      body: tableData,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { top: 30 },
    });
    
    // Save the PDF
    const filename = `timesheet-export-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
    
    toast.success("PDF exported successfully");
  } catch (error) {
    console.error("PDF export failed:", error);
    toast.error("Failed to export PDF");
  }
};
