
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LogoUploadProps {
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  onLogoUploaded: (url: string) => void;
}

const LogoUpload: React.FC<LogoUploadProps> = ({
  previewUrl,
  setPreviewUrl,
  onLogoUploaded
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) {
      if (!user?.id) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to upload a logo",
          variant: "destructive"
        });
      }
      return;
    }
    
    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG, JPEG or SVG image",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Logo file size should be less than 2MB",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create a filename with timestamp to avoid conflicts
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${timestamp}.${fileExt}`;
      
      console.log("Uploading file to:", filePath);
      
      // Upload the file to Supabase storage
      const { data, error } = await supabase
        .storage
        .from('logos')
        .upload(filePath, file, { upsert: true });
        
      if (error) {
        console.error("Storage upload error:", error);
        throw error;
      }
      
      console.log("Upload successful:", data);
      
      // Get the public URL for the uploaded file
      const publicUrl = supabase
        .storage
        .from('logos')
        .getPublicUrl(filePath)
        .data.publicUrl;
      
      console.log("Public URL:", publicUrl);
      
      // Update the form value and preview
      onLogoUploaded(publicUrl);
      setPreviewUrl(publicUrl);
      
      toast({
        title: "Logo uploaded",
        description: "Your logo has been uploaded successfully"
      });
      
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload failed",
        description: `Failed to upload logo: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="logo">Company Logo</Label>
      <div className="flex flex-col items-center space-y-4">
        {previewUrl && (
          <div className="border rounded p-2 mb-2 max-w-[200px]">
            <img 
              src={previewUrl} 
              alt="Company Logo" 
              className="h-24 object-contain" 
            />
          </div>
        )}
        
        <div className="w-full">
          <Input
            id="logo"
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/svg+xml"
            onChange={handleLogoSelect}
            disabled={isUploading}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Supported formats: PNG, JPEG, SVG. Max size: 2MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoUpload;
