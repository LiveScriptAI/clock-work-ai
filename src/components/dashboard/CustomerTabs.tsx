
import React, { useEffect, useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { save, load } from "@/services/localStorageService";
import { useCustomers } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Define the form schema with Zod
const formSchema = z.object({
  businessName: z.string().min(1, {
    message: "Business name is required"
  }),
  contactName: z.string().min(1, {
    message: "Contact name is required"
  }),
  email: z.string().email({
    message: "Invalid email address"
  }),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  phoneNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  termsAndConditions: z.string().optional(),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const defaultFormValues: FormValues = {
  businessName: "",
  contactName: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  county: "",
  postcode: "",
  country: "",
  phoneNumber: "",
  vatNumber: "",
  termsAndConditions: "",
  notes: ""
};

const CustomerTabs = () => {
  const { toast } = useToast();
  const { addCustomer } = useCustomers();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize react-hook-form with zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues
  });

  // Load draft data from user-scoped storage on component mount
  useEffect(() => {
    try {
      const draftData = load<FormValues>('customerFormDraft');
      if (draftData) {
        form.reset(draftData);
      }
    } catch (error) {
      console.error("Failed to load customer form draft:", error);
    }
  }, [form]);

  // Save draft data whenever form changes
  const watchedValues = form.watch();
  useEffect(() => {
    // Only save draft if there's actual content
    const hasContent = Object.values(watchedValues).some(value => 
      typeof value === 'string' && value.trim().length > 0
    );
    
    if (hasContent) {
      save('customerFormDraft', watchedValues);
    }
  }, [watchedValues]);

  // Handle form submission with immediate state refresh
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      // Add customer through context (handles all storage)
      const newCustomer = addCustomer({
        company_name: data.businessName,
        contact_name: data.contactName,
        email: data.email,
        address1: data.address1 || "",
        address2: data.address2 || "",
        city: data.city || "",
        county: data.county || "",
        postcode: data.postcode || "",
        country: data.country || "",
        phone_number: data.phoneNumber || "",
        vat_number: data.vatNumber || "",
        terms_conditions: data.termsAndConditions || "",
        notes: data.notes || ""
      });
      
      // Clear the form immediately
      form.reset(defaultFormValues);
      
      // Clear the draft storage
      save('customerFormDraft', defaultFormValues);
      
      toast({
        title: "Success",
        description: `Customer "${newCustomer.company_name}" saved successfully and is now available in invoice forms`
      });
      
    } catch (error) {
      console.error("Error saving customer data:", error);
      toast({
        title: "Error",
        description: "Failed to save customer information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-4 bg-white shadow-sm rounded-2xl">
      <div className="space-y-2 mb-4">
        <h2 className="text-2xl font-bold text-center">Customer Information</h2>
        <p className="text-sm text-muted-foreground text-center">
          Enter customer details to be used in your invoices
        </p>
      </div>

      <Tabs defaultValue="customer-details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customer-details">Customer Details</TabsTrigger>
          <TabsTrigger value="notes">T&C/Notes</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Customer Details Tab */}
            <TabsContent value="customer-details" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Business Name */}
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter business name" className="w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Contact Name */}
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact name" className="w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" type="email" className="w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" className="w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* VAT Number */}
                <FormField
                  control={form.control}
                  name="vatNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VAT Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter VAT number" className="w-full" {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Address Line 1 */}
                <FormField
                  control={form.control}
                  name="address1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter address line 1" className="w-full" {...field} />
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
                        <Input placeholder="Enter address line 2" className="w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* City */}
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" className="w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* County */}
                <FormField
                  control={form.control}
                  name="county"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>County/State</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter county or state" className="w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Postcode */}
                <FormField
                  control={form.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode/ZIP</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter postcode or ZIP code" className="w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Country */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter country" className="w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
            
            {/* T&C/Notes Tab */}
            <TabsContent value="notes" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Terms and Conditions */}
                <FormField
                  control={form.control}
                  name="termsAndConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms and Conditions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter terms and conditions"
                          className="min-h-[120px] w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter additional notes about this customer"
                          className="min-h-[120px] w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
            
            <Button type="submit" disabled={isLoading} className="w-full my-4">
              {isLoading ? "Saving..." : "Save Customer"}
            </Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default CustomerTabs;
