import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { save, load } from "@/services/localStorageService";
import { Camera as CameraIcon, Upload } from "lucide-react";
import { Camera, CameraResultType, CameraSource } from '@/services/cameraService';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";

export type InvoiceSettingsType = {
  business_name: string;
  contact_name: string;
  address1: string;
  address2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  logo_url?: string;
};

const MyCompanyForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logoChanged, setLogoChanged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<InvoiceSettingsType>({
    defaultValues: {
      business_name: "",
      contact_name: "",
      address1: "",
      address2: "",
      city: "",
      county: "",
      postcode: "",
      country: "",
      logo_url: ""
    }
  });

  // Load saved settings & logo
  useEffect(() => {
    setIsLoading(true);
    try {
      const savedSettings = load<InvoiceSettingsType>("companySettings");
      const savedLogo = load<string>("companyLogo");

      if (savedSettings) {
        form.reset(savedSettings);
      }
      if (savedLogo) {
        setPreviewUrl(savedLogo);
        form.setValue("logo_url", savedLogo);
      }
    } catch (err) {
      console.error("Failed to load company settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, [form]);

  // Handle selecting a new logo file (preview only)
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg", "image/svg+xml"].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please use PNG, JPEG, or SVG",
        variant: "destructive"
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Max size is 2MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreviewUrl(base64);
      form.setValue("logo_url", base64);
      setLogoChanged(true);
    };
    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "Could not read file",
        variant: "destructive"
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle camera capture using Capacitor
  const handleCameraCapture = async () => {
    try {
      setIsLoading(true);
      
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      const base64Image = photo.dataUrl;
      if (base64Image) {
        setPreviewUrl(base64Image);
        form.setValue("logo_url", base64Image);
        setLogoChanged(true);
        
        toast({
          title: "Success",
          description: "Photo captured successfully"
        });
      }
    } catch (error) {
      console.error("Camera error:", error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions or try uploading a file instead.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload from device
  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // On Save click: persist both form fields and logo with immediate refresh
  const onSubmit = async (data: InvoiceSettingsType) => {
    setIsLoading(true);
    try {
      save("companySettings", data);
      if (logoChanged && previewUrl) {
        save("companyLogo", previewUrl);
      }
      
      // Trigger custom event for other components to refresh immediately
      window.dispatchEvent(new CustomEvent('companySettingsUpdated', { 
        detail: data 
      }));
      
      toast({
        title: "Success",
        description: "Company information saved and updated across the app"
      });
      setLogoChanged(false);
    } catch (err) {
      console.error("Error saving company settings:", err);
      toast({
        title: "Error",
        description: "Could not save company settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card className="w-full rounded-2xl">
          <CardContent className="p-4 space-y-4">
            {/* Company Logo Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-center">Company Logo</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Upload your company logo for use on invoices and summaries.
                </p>
              </div>

              {/* Logo Preview */}
              <div className="flex justify-center">
                {previewUrl ? (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-2xl p-2 flex items-center justify-center bg-gray-50">
                    <img
                      src={previewUrl}
                      alt="Company Logo Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-muted rounded-2xl flex items-center justify-center bg-muted/30">
                    <div className="text-center text-muted-foreground space-y-1">
                      <Upload className="w-6 h-6 mx-auto" />
                      <div className="text-xs">No logo yet</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCameraCapture()}
                  disabled={isLoading}
                  className="w-full flex items-center gap-2"
                >
                  <CameraIcon size={16} />
                  Take Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFileUpload()}
                  disabled={isLoading}
                  className="w-full flex items-center gap-2"
                >
                  <Upload size={16} />
                  Upload from Device
                </Button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                onChange={handleLogoSelect}
                className="hidden"
              />

              {/* Privacy Notice */}
              <p className="text-xs text-gray-500 text-center">
                Note: On iOS, camera access is required. You'll be prompted to allow access when you tap 'Take Photo.'
                The image will remain private unless included on invoices.
              </p>
            </div>

            {/* Business Name */}
            <FormField
              control={form.control}
              name="business_name"
              rules={{ required: "Business name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Business Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Name */}
            <FormField
              control={form.control}
              name="contact_name"
              rules={{ required: "Contact name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Line 1 */}
            <FormField
              control={form.control}
              name="address1"
              rules={{ required: "Address line 1 is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1 *</FormLabel>
                  <FormControl>
                    <Input placeholder="Street Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Line 2 */}
            <FormField
              control={form.control}
              name="address2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2</FormLabel>
                  <FormControl>
                    <Input placeholder="Apartment, Suite, etc. (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4">
              {/* City */}
              <FormField
                control={form.control}
                name="city"
                rules={{ required: "City is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input placeholder="City" className="w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* County/State */}
              <FormField
                control={form.control}
                name="county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>County/State</FormLabel>
                    <FormControl>
                      <Input placeholder="County or State (optional)" className="w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Postcode/ZIP */}
              <FormField
                control={form.control}
                name="postcode"
                rules={{ required: "Postcode/ZIP is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode/ZIP *</FormLabel>
                    <FormControl>
                      <Input placeholder="Postcode or ZIP code" className="w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Country */}
              <FormField
                control={form.control}
                name="country"
                rules={{ required: "Country is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" className="w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>

          {/* Save button in footer */}
          <CardFooter className="p-4">
            <Button type="submit" disabled={isLoading} className="w-full my-4">
              {isLoading ? "Saving..." : "Save My Company Details"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default MyCompanyForm;
