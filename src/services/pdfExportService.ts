import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { toast } from 'sonner';

export interface PDFShareOptions {
  fileName: string;
  pdfBlob: Blob;
}

export const sharePDF = async ({ fileName, pdfBlob }: PDFShareOptions): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Convert blob to base64 for native platforms
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      // Write to temporary file
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });
      
      // Share the file
      await Share.share({
        title: 'Share PDF',
        url: result.uri,
        dialogTitle: 'Save or Share PDF',
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
    toast.error('Failed to share PDF');
    throw error;
  }
};