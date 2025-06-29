import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { save, load } from "@/services/localStorageService";

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label htmlFor="logo">Company Logo</Label>
              <div className="flex flex-col items-center space-y-4">
                {previewUrl && (
                  <div className="border rounded p-2 max-w-[200px]">
                    <img
                      src={previewUrl}
                      alt="Company Logo Preview"
                      className="h-24 object-contain"
                    />
                  </div>
                )}
                <Input
                  id="logo"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                  onChange={handleLogoSelect}
                  disabled={isLoading}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: PNG, JPEG, SVG. Max size: 2MB
                </p>
              </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* City */}
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
              {/* County/State */}
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
              {/* Postcode/ZIP */}
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
              {/* Country */}
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
          </CardContent>

          {/* Save button in footer */}
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save My Company Details"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default MyCompanyForm;
