// src/components/dashboard/invoice/MyCompanyForm.tsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { save, load } from "@/services/localStorageService";

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

export type InvoiceSettingsType = {
  business_name: string;
  address1: string;
  address2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  logo_url?: string;
};

const MyCompanyForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logoChanged, setLogoChanged] = useState(false);

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

  // Load existing settings & logo from localStorage
  useEffect(() => {
    setIsLoading(true);
    try {
      const data = load<InvoiceSettingsType>('companySettings');
      const logoData = load<string>('companyLogo');

      if (data) {
        form.reset({ ...data });
      }
      if (logoData) {
        setPreviewUrl(logoData);
        form.setValue('logo_url', logoData);
      }
    } catch (error) {
      console.error("Failed to load company settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [form]);

  // Only update preview & form field — do NOT save yet
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type & size
    if (!['image/png','image/jpeg','image/jpg','image/svg+xml'].includes(file.type)) {
      toast({ title: "Invalid file type", description: "PNG, JPEG or SVG only", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max size is 2MB", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreviewUrl(base64);
      form.setValue('logo_url', base64);
      setLogoChanged(true);
    };
    reader.onerror = () => {
      toast({ title: "Upload failed", description: "Couldn't read that file", variant: "destructive" });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: InvoiceSettingsType) => {
    setIsLoading(true);
    try {
      // 1) Save the form data
      save('companySettings', data);

      // 2) If the user selected a new logo, persist it too
      if (logoChanged && previewUrl) {
        save('companyLogo', previewUrl);
      }

      toast({ title: "Saved", description: "Company details updated" });
      setLogoChanged(false);
    } catch (error) {
      console.error("Error saving company settings:", error);
      toast({ title: "Error", description: "Couldn't save settings", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Logo upload */}
            <div className="space-y-2">
              <Label htmlFor="logo">Company Logo</Label>
              <div className="flex flex-col items-center space-y-4">
                {previewUrl && (
                  <div className="border rounded p-2 max-w-[200px]">
                    <img src={previewUrl} alt="Company Logo" className="h-24 object-contain" />
                  </div>
                )}
                <Input
                  id="logo"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                  onChange={handleLogoSelect}
                  className="cursor-pointer"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: PNG, JPEG, SVG. Max size: 2MB
                </p>
              </div>
            </div>

            {/* Other form fields */}
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

            {/* address1, address2, city, county... */}
            {/* (same as before) */}
            {/* ... */}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save My Company Details"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MyCompanyForm;
