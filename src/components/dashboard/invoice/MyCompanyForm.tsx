
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
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

const MyCompanyForm = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<InvoiceSettingsType>({
    defaultValues: {
      business_name: "",
      address1: "",
      address2: "",
      city: "",
      county: "",
      postcode: "",
      country: ""
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
            country: data.country
          });
        }
      } catch (error) {
        console.error("Failed to load company settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [user, form]);
  
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
            disabled={isLoading}
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
