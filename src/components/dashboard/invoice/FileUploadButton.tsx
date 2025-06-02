
import React, { useRef, useState } from "react";
import { Upload, Camera, FileImage, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ 
  onFileSelect, 
  disabled = false 
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
    <>
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
    </>
  );
};

export default FileUploadButton;
