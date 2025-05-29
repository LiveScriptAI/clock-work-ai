
import { ShiftEntry } from "./types";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, parseISO, differenceInSeconds } from "date-fns";
import { getBreakIntervalsByShift } from "@/services/breakIntervalsService";
import { formatDuration } from "@/components/dashboard/utils";

// Format date for CSV and PDF
const formatDate = (date: Date): string => {
  return date.toLocaleString();
};

// Format break intervals for export
const formatBreakIntervals = (breakIntervals?: { start: string; end: string }[]): string => {
  if (!breakIntervals || breakIntervals.length === 0) {
    return "No breaks";
  }
  
  return breakIntervals
    .map(i => `${format(parseISO(i.start), 'HH:mm:ss')}–${format(parseISO(i.end), 'HH:mm:ss')}`)
    .join(' | ');
};

// Function to download CSV file
export const downloadCSV = (shifts: ShiftEntry[], importBreaksToExport: boolean = false): void => {
  try {
    console.log("CSV Export - importBreaksToExport:", importBreaksToExport);
    console.log("CSV Export - shifts data:", shifts);
    
    if (shifts.length === 0) {
      toast.error("No shifts to export");
      return;
    }

    // Get break intervals if needed
    const breakIntervalsByShift = importBreaksToExport ? getBreakIntervalsByShift() : {};
    console.log("CSV Export - breakIntervalsByShift:", breakIntervalsByShift);
    console.log("CSV Export - Total shifts with breaks found:", Object.keys(breakIntervalsByShift).length);
    
    // Calculate max number of breaks across all shifts for dynamic headers
    let maxBreaks = 0;
    if (importBreaksToExport) {
      Object.values(breakIntervalsByShift).forEach(intervals => {
        if (intervals.length > maxBreaks) {
          maxBreaks = intervals.length;
        }
      });
      console.log("CSV Export - maxBreaks found:", maxBreaks);
      
      // If no breaks in stored data, check if shifts have break intervals
      if (maxBreaks === 0) {
        shifts.forEach(shift => {
          if (shift.breakIntervals && shift.breakIntervals.length > maxBreaks) {
            maxBreaks = shift.breakIntervals.length;
          }
        });
        console.log("CSV Export - maxBreaks from shift data:", maxBreaks);
      }
    }

    // CSV Headers - base headers
    const baseHeaders = [
      "Date", 
      "Employer Name", 
      "Start Time", 
      "End Time", 
      "Total Hours Worked", 
      "Pay Rate and Type", 
      "Estimated Earnings", 
      "Payment Status"
    ];

    // Add break headers if importing breaks
    const breakHeaders: string[] = [];
    if (importBreaksToExport && maxBreaks > 0) {
      for (let i = 1; i <= maxBreaks; i++) {
        breakHeaders.push(`Break ${i} Start`, `Break ${i} End`);
      }
      console.log("CSV Export - breakHeaders:", breakHeaders);
    } else if (importBreaksToExport) {
      // Add a single breaks column if we have break data but no specific intervals
      breakHeaders.push("Breaks");
      console.log("CSV Export - Added single breaks column");
    }

    const headers = [...baseHeaders, ...breakHeaders];

    // Convert shift data to CSV rows
    const csvContent = shifts.map((shift) => {
      console.log("CSV Export - Processing shift:", shift.id, shift.employer);
      
      const baseRow = [
        formatDate(shift.date),
        shift.employer,
        formatDate(shift.startTime),
        formatDate(shift.endTime),
        `${shift.hoursWorked.toFixed(2)} hours`,
        `$${shift.payRate} ${shift.payType}`,
        `$${shift.earnings.toFixed(2)}`,
        shift.status
      ];

      // Add break data if importing breaks
      const breakData: string[] = [];
      if (importBreaksToExport) {
        // First try to get breaks from stored intervals by shift ID
        let shiftBreaks = breakIntervalsByShift[shift.id] || [];
        
        // If no breaks found in stored data, try shift.breakIntervals
        if (shiftBreaks.length === 0 && shift.breakIntervals) {
          shiftBreaks = shift.breakIntervals;
          console.log("CSV Export - Using shift.breakIntervals for", shift.id, ":", shiftBreaks);
        }
        
        // If we have dynamic break columns
        if (maxBreaks > 0) {
          for (let i = 0; i < maxBreaks; i++) {
            if (i < shiftBreaks.length) {
              breakData.push(
                format(parseISO(shiftBreaks[i].start), 'HH:mm:ss'),
                format(parseISO(shiftBreaks[i].end), 'HH:mm:ss')
              );
            } else {
              breakData.push('', ''); // Empty cells for missing breaks
            }
          }
        } else {
          // Single breaks column
          breakData.push(formatBreakIntervals(shiftBreaks));
        }
        
        console.log("CSV Export - Break data for shift", shift.id, ":", breakData);
      }

      return [...baseRow, ...breakData].join(",");
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
    console.log("CSV Export completed successfully");
  } catch (error) {
    console.error("CSV export failed:", error);
    toast.error("Failed to export CSV");
  }
};

// Function to download PDF file
export const downloadPDF = (shifts: ShiftEntry[], importBreaksToExport: boolean = false): void => {
  try {
    console.log("PDF Export - importBreaksToExport:", importBreaksToExport);
    console.log("PDF Export - shifts data:", shifts);
    
    if (shifts.length === 0) {
      toast.error("No shifts to export");
      return;
    }
    
    // Get break intervals if needed
    const breakIntervalsByShift = importBreaksToExport ? getBreakIntervalsByShift() : {};
    console.log("PDF Export - breakIntervalsByShift:", breakIntervalsByShift);
    console.log("PDF Export - Total shifts with breaks found:", Object.keys(breakIntervalsByShift).length);
    
    // Initialize new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("Timesheet Log", 14, 15);
    
    // Add export date
    doc.setFontSize(10);
    doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 22);
    
    // Add break intervals notice if enabled
    if (importBreaksToExport) {
      doc.text("(Including break intervals)", 14, 27);
    }
    
    // Base table headers
    const baseTableHeaders = [
      "Date", 
      "Employer", 
      "Start Time", 
      "End Time", 
      "Hours", 
      "Rate", 
      "Earnings", 
      "Status"
    ];

    // Add breaks column if importing breaks
    const tableHeaders = importBreaksToExport 
      ? [...baseTableHeaders, "Breaks"]
      : baseTableHeaders;
    
    // Prepare table data
    const tableData = shifts.map((shift) => {
      console.log("PDF Export - Processing shift:", shift.id, shift.employer);
      
      const baseRowData = [
        format(shift.date, 'MM/dd/yyyy'),
        shift.employer,
        format(shift.startTime, 'HH:mm'),
        format(shift.endTime, 'HH:mm'),
        `${shift.hoursWorked.toFixed(2)}h`,
        `$${shift.payRate}/${shift.payType}`,
        `$${shift.earnings.toFixed(2)}`,
        shift.status
      ];

      // Add break data if importing breaks
      if (importBreaksToExport) {
        // First try to get breaks from stored intervals by shift ID
        let shiftBreaks = breakIntervalsByShift[shift.id] || [];
        
        // If no breaks found in stored data, try shift.breakIntervals
        if (shiftBreaks.length === 0 && shift.breakIntervals) {
          shiftBreaks = shift.breakIntervals;
          console.log("PDF Export - Using shift.breakIntervals for", shift.id, ":", shiftBreaks);
        }
        
        const breaksText = shiftBreaks.length > 0 
          ? shiftBreaks.map(interval => 
              `${format(parseISO(interval.start), 'HH:mm')}–${format(parseISO(interval.end), 'HH:mm')}`
            ).join(', ')
          : 'No breaks';
        
        console.log("PDF Export - Breaks text for shift", shift.id, ":", breaksText);
        return [...baseRowData, breaksText];
      }

      return baseRowData;
    });
    
    // Generate table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: importBreaksToExport ? 35 : 30,
      theme: 'grid',
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: importBreaksToExport ? {
        8: { cellWidth: 40 } // Breaks column width
      } : {},
      margin: { top: 30 },
    });
    
    // Save the PDF
    const filename = `timesheet-export-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
    
    toast.success("PDF exported successfully");
    console.log("PDF Export completed successfully");
  } catch (error) {
    console.error("PDF export failed:", error);
    toast.error("Failed to export PDF");
  }
};

// Export breaks to CSV for specific shift
export const exportBreaksToCSV = async (breakData: Record<string, Array<{start: string; end: string}>>) => {
  try {
    const csvContent = generateBreaksCSV(breakData);
    downloadFile(csvContent, `breaks-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    console.log("Breaks CSV export completed successfully");
  } catch (error) {
    console.error('Error exporting breaks to CSV:', error);
    throw error;
  }
};

// Export breaks to PDF for specific shift
export const exportBreaksToPDF = async (breakData: Record<string, Array<{start: string; end: string}>>) => {
  try {
    console.log("Starting breaks PDF export with data:", breakData);
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Break Summary Report', 20, 20);
    
    // Add generation date
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, 35);
    
    let yPosition = 50;
    
    Object.entries(breakData).forEach(([shiftId, intervals]) => {
      // Add shift date using the same formatting logic as CSV
      doc.setFontSize(14);
      const shiftDate = formatShiftDisplayForExport(shiftId);
      doc.text(`Date: ${shiftDate}`, 20, yPosition);
      yPosition += 10;
      
      // Create table data for breaks
      const tableData = intervals.map((interval, index) => [
        `Break ${index + 1}`,
        format(parseISO(interval.start), 'HH:mm'),
        format(parseISO(interval.end), 'HH:mm'),
        formatDuration(differenceInSeconds(parseISO(interval.end), parseISO(interval.start)))
      ]);
      
      // Add breaks table using autoTable correctly
      autoTable(doc, {
        startY: yPosition,
        head: [['Break', 'Start Time', 'End Time', 'Duration']],
        body: tableData,
        margin: { left: 20, right: 20 },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      
      // Update yPosition after table
      yPosition = (doc as any).lastAutoTable.finalY + 20;
      
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    });
    
    doc.save(`breaks-${new Date().toISOString().split('T')[0]}.pdf`);
    console.log("Breaks PDF export completed successfully");
  } catch (error) {
    console.error('Error exporting breaks to PDF:', error);
    throw error;
  }
};

const generateBreaksCSV = (breakData: Record<string, Array<{start: string; end: string}>>) => {
  const headers = ['Date', 'Break Number', 'Start Time', 'End Time', 'Duration'];
  const rows = [headers];
  
  Object.entries(breakData).forEach(([shiftId, intervals]) => {
    const shiftDate = formatShiftDisplayForExport(shiftId);
    
    intervals.forEach((interval, index) => {
      const duration = formatDuration(differenceInSeconds(parseISO(interval.end), parseISO(interval.start)));
      rows.push([
        shiftDate,
        `Break ${index + 1}`,
        format(parseISO(interval.start), 'HH:mm'),
        format(parseISO(interval.end), 'HH:mm'),
        duration
      ]);
    });
  });
  
  return rows.map(row => row.join(',')).join('\n');
};

// Helper function for formatting shift display in exports
const formatShiftDisplayForExport = (shiftId: string): string => {
  // Check if shiftId is in date format (YYYY-MM-DD)
  if (shiftId.match(/^\d{4}-\d{2}-\d{2}$/)) {
    try {
      const date = parseISO(shiftId);
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error("Error formatting date:", error);
      return shiftId;
    }
  }
  
  // For legacy timestamp-based IDs, try to extract date
  if (shiftId.startsWith('current_shift_') || shiftId.startsWith('test_shift_')) {
    const timestamp = shiftId.split('_').pop();
    if (timestamp && !isNaN(Number(timestamp))) {
      try {
        const date = new Date(Number(timestamp));
        return format(date, 'MMMM d, yyyy');
      } catch (error) {
        console.error("Error formatting timestamp:", error);
        return shiftId;
      }
    }
  }
  
  return shiftId;
};

const formatShiftDisplay = (shiftId: string): string => {
  // Check if shiftId is in date format (YYYY-MM-DD)
  if (shiftId.match(/^\d{4}-\d{2}-\d{2}$/)) {
    try {
      const date = parseISO(shiftId);
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error("Error formatting date:", error);
      return shiftId;
    }
  }
  
  // For legacy timestamp-based IDs, try to extract date
  if (shiftId.startsWith('current_shift_') || shiftId.startsWith('test_shift_')) {
    const timestamp = shiftId.split('_').pop();
    if (timestamp && !isNaN(Number(timestamp))) {
      try {
        const date = new Date(Number(timestamp));
        return format(date, 'MMMM d, yyyy');
      } catch (error) {
        console.error("Error formatting timestamp:", error);
        return shiftId;
      }
    }
  }
  
  return shiftId;
};

// Function to download file
const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.display = "none";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
