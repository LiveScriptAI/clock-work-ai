
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  InvoiceSettingsType, 
  fetchInvoiceSettings, 
  upsertInvoiceSettings 
} from "@/services/invoiceSettingsService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Image } from "lucide-react";

const MyCompanyForm = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<InvoiceSettingsType>({
    defaultValues: {
      business_name: "",
      address1: "",
      address2: "",
      city: "",
      county: "",
      postcode: "",
      country: "",
      logo_url: ""
    }
  });
  
  // Fetch existing settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const data = await fetchInvoiceSettings(user.id);
        if (data) {
          // Reset form with fetched data
          form.reset({
            business_name: data.business_name,
            address1: data.address1,
            address2: data.address2 || "",
            city: data.city,
            county: data.county || "",
            postcode: data.postcode,
            country: data.country,
            logo_url: data.logo_url || ""
          });
          
          // Set preview URL if logo exists
          if (data.logo_url) {
            setPreviewUrl(data.logo_url);
          }
        }
      } catch (error) {
        console.error("Failed to load company settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [user, form]);
  
  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    
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
      
      // Upload the file to Supabase storage
      const { data, error } = await supabase
        .storage
        .from('logos')
        .upload(filePath, file, { upsert: true });
        
      if (error) throw error;
      
      // Get the public URL for the uploaded file
      const publicUrl = supabase
        .storage
        .from('logos')
        .getPublicUrl(filePath)
        .data.publicUrl;
      
      // Update the form value and preview
      form.setValue('logo_url', publicUrl);
      setPreviewUrl(publicUrl);
      
      toast({
        title: "Logo uploaded",
        description: "Your logo has been uploaded successfully"
      });
      
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const onSubmit = async (data: InvoiceSettingsType) => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save company settings",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await upsertInvoiceSettings(user.id, data);
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "My Company information saved",
      });
    } catch (error) {
      console.error("Error saving company settings:", error);
      toast({
        title: "Error",
        description: "Failed to save company settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Logo Upload Section */}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  rules={{ required: "City is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="county"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>County/State</FormLabel>
                      <FormControl>
                        <Input placeholder="County or State (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postcode"
                  rules={{ required: "Postcode/ZIP is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode/ZIP *</FormLabel>
                      <FormControl>
                        <Input placeholder="Postcode or ZIP code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  rules={{ required: "Country is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading || isUploading}
            className="w-full md:w-auto"
          >
            {isLoading ? "Saving..." : "Save My Company Details"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MyCompanyForm;
