import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PDFShareOptions {
  fileName: string;
  pdfBlob: Blob;
}

export interface PDFExportResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

export const sharePDF = async ({ fileName, pdfBlob }: PDFShareOptions): Promise<void> => {
  try {
    console.log('PDF sharing started:', { fileName, blobSize: pdfBlob.size });
    
    // Validate PDF blob
    if (!pdfBlob || pdfBlob.size === 0) {
      throw new Error('Invalid PDF blob provided');
    }
    
    if (pdfBlob.size < 1000) {
      console.warn('PDF blob suspiciously small:', pdfBlob.size);
    }

    if (Capacitor.isNativePlatform()) {
      // CRITICAL: Use FileReader for proper base64 conversion (handles large files)
      const base64Data = await blobToBase64(pdfBlob);
      console.log('Base64 conversion successful, length:', base64Data.length);
      
      // CRITICAL: Add encoding: 'base64' parameter for iOS
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
        encoding: 'base64' as any // Cast to satisfy TypeScript
      });
      
      console.log('File written successfully:', result.uri);
      
      // Clean URI (remove trailing slashes)
      const cleanUri = result.uri.replace(/\/$/, '');
      
      // CRITICAL: Use proper object format for Capacitor Share API
      await Share.share({
        title: 'Share PDF',
        text: `${fileName} - Ready to save or share`,
        url: cleanUri,
        dialogTitle: 'Share PDF Document'
      });
      
      toast.success('PDF ready to share or save');
    } else {
      // Web fallback - traditional download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully');
    }
  } catch (error) {
    console.error('Error sharing PDF:', error);
    
    // Handle specific iOS entitlement errors
    if (error instanceof Error && error.message.includes('RBSServiceErrorDomain')) {
      console.error('iOS entitlement error detected:', error.message);
      toast.error('PDF sharing requires additional permissions. Please try again or restart the app.');
    } else if (error instanceof Error && error.message.includes('Client not entitled')) {
      console.error('iOS client entitlement error:', error.message);
      toast.error('App permissions issue. Please restart the app and try again.');
    } else {
      toast.error('Failed to share PDF');
    }
    
    throw error;
  }
};

// CRITICAL: Use FileReader instead of btoa for large files
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1]; // Remove data URL prefix
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Debug helper for PDF validation
export const validatePDFBlob = (blob: Blob): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (!blob) {
    issues.push('Blob is null or undefined');
    return { isValid: false, issues };
  }
  
  if (blob.size === 0) {
    issues.push('Blob is empty (0 bytes)');
  }
  
  if (blob.size < 1000) {
    issues.push(`Blob suspiciously small: ${blob.size} bytes`);
  }
  
  if (blob.type && !blob.type.includes('pdf')) {
    issues.push(`Unexpected MIME type: ${blob.type}`);
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};