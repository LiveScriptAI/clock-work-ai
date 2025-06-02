
import React, { useRef, useState } from "react";
import { Upload, Camera, FileImage, File, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { FileAttachment } from "./invoice-types";

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  attachments?: FileAttachment[];
  onRemoveAttachment?: (attachmentId: string) => void;
  onViewAttachment?: (attachment: FileAttachment) => void;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ 
  onFileSelect, 
  disabled = false,
  attachments = [],
  onRemoveAttachment,
  onViewAttachment
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid file type (images, PDF, or documents)");
        return;
      }

      onFileSelect(file);
      toast.success(`File "${file.name}" uploaded successfully`);
    }
    
    // Reset input value to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
    setIsOpen(false);
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotosSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Check if device has camera capabilities
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div className="space-y-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            disabled={disabled}
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 bg-white border border-gray-200 shadow-lg z-50"
        >
          {isMobile && (
            <DropdownMenuItem 
              onClick={handleCameraCapture}
              className="flex items-center cursor-pointer hover:bg-gray-50"
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            onClick={handlePhotosSelect}
            className="flex items-center cursor-pointer hover:bg-gray-50"
          >
            <FileImage className="h-4 w-4 mr-2" />
            Choose from Photos
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleFileSelect}
            className="flex items-center cursor-pointer hover:bg-gray-50"
          >
            <File className="h-4 w-4 mr-2" />
            Browse Files
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Display attachments */}
      {attachments.length > 0 && (
        <div className="space-y-1">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border text-xs">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {attachment.type.startsWith('image/') ? (
                  <FileImage className="h-3 w-3 text-blue-500 flex-shrink-0" />
                ) : (
                  <File className="h-3 w-3 text-gray-500 flex-shrink-0" />
                )}
                <span className="truncate text-gray-700">{attachment.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                {onViewAttachment && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onViewAttachment(attachment)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                )}
                {onRemoveAttachment && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-700"
                    onClick={() => onRemoveAttachment(attachment.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        multiple={false}
      />
      
      {/* Camera input for mobile devices */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        multiple={false}
      />
    </div>
  );
};

export default FileUploadButton;
