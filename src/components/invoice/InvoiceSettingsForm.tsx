
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, User, Phone, Building, Hash } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

// Form schema with validation
const settingsFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  phoneNumber: z.string().optional(),
  emailAddress: z.string().email("Invalid email address"),
  address: z.string().optional(),
  vatNumber: z.string().optional()
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const InvoiceSettingsForm: React.FC = () => {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      phoneNumber: "",
      emailAddress: "",
      address: "",
      vatNumber: ""
    }
  });

  function onSubmit(data: SettingsFormValues) {
    // This is just a UI placeholder - no actual submission will happen yet
    toast({
      title: "Form Submitted",
      description: "Your invoice settings have been saved (UI only).",
    });
    
    console.log("Form data (UI only):", data);
    form.reset();
  }

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Invoice Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Company Name*
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Contact Name*
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="emailAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address*
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Address
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter company address" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vatNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    VAT Number
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter VAT number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="px-0 pt-4">
              <Button type="submit" className="ml-auto">
                Save Settings
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default InvoiceSettingsForm;
