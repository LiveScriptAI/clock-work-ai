import React from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Define the form schema with Zod - removed payment details fields
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
  // Terms and conditions moved to notes tab
  termsAndConditions: z.string().optional(),
  // Notes field
  notes: z.string().optional()
});
type FormValues = z.infer<typeof formSchema>;
const CustomerTabs = () => {
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();

  // Initialize react-hook-form with zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      contactName: "",
      email: "",
      // Address fields
      address1: "",
      address2: "",
      city: "",
      county: "",
      postcode: "",
      country: "",
      phoneNumber: "",
      vatNumber: "",
      // Terms and conditions default
      termsAndConditions: "",
      // Notes default
      notes: ""
    }
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save customer data",
        variant: "destructive"
      });
      return;
    }
    try {
      // Map form data to database fields - removed payment details
      const payload = {
        user_id: user.id,
        company_name: data.businessName,
        contact_name: data.contactName,
        email: data.email,
        // Map granular address fields
        address1: data.address1 || null,
        address2: data.address2 || null,
        city: data.city || null,
        county: data.county || null,
        postcode: data.postcode || null,
        country: data.country || null,
        // Keep other fields
        phone_number: data.phoneNumber || null,
        vat_number: data.vatNumber || null,
        // Terms and conditions field
        terms_conditions: data.termsAndConditions || null,
        // Notes field
        notes: data.notes || null,
        // Set payment details fields to null since we removed them
        payment_terms: null,
        credit_terms: null,
        bank_account_name: null,
        sort_code: null,
        account_number: null,
        bic_swift: null,
        iban: null
      };

      // Save to Supabase
      const {
        error
      } = await supabase.from("invoice_recipients").insert([payload]);
      if (error) {
        console.error("Error saving customer:", error);
        toast({
          title: "Error",
          description: "Failed to save customer information",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Customer information saved successfully"
        });
        form.reset();
      }
    } catch (error) {
      console.error("Error in customer save:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  return <div className="space-y-6 p-4 bg-white shadow-sm rounded-xl">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Customer Information</h2>
        <p className="text-sm text-muted-foreground">
          Enter customer details to be used in your invoices
        </p>
      </div>

      <Tabs defaultValue="customer-details" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="customer-details">Customer Details</TabsTrigger>
          <TabsTrigger value="notes">T&C/Notes</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Customer Details Tab */}
            <TabsContent value="customer-details" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Name */}
                <FormField control={form.control} name="businessName" render={({
                field
              }) => <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter business name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                {/* Contact Name */}
                <FormField control={form.control} name="contactName" render={({
                field
              }) => <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                {/* Email */}
                <FormField control={form.control} name="email" render={({
                field
              }) => <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                {/* Phone Number */}
                <FormField control={form.control} name="phoneNumber" render={({
                field
              }) => <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                {/* VAT Number */}
                <FormField control={form.control} name="vatNumber" render={({
                field
              }) => <FormItem>
                      <FormLabel>VAT Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter VAT number" {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>} />
                
                {/* Address Line 1 */}
                <FormField control={form.control} name="address1" render={({
                field
              }) => <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter address line 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                {/* Address Line 2 */}
                <FormField control={form.control} name="address2" render={({
                field
              }) => <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter address line 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                {/* City */}
                <FormField control={form.control} name="city" render={({
                field
              }) => <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                {/* County */}
                <FormField control={form.control} name="county" render={({
                field
              }) => <FormItem>
                      <FormLabel>County/State</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter county or state" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                {/* Postcode */}
                <FormField control={form.control} name="postcode" render={({
                field
              }) => <FormItem>
                      <FormLabel>Postcode/ZIP</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter postcode or ZIP code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                {/* Country */}
                <FormField control={form.control} name="country" render={({
                field
              }) => <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>
            </TabsContent>
            
            {/* T&C/Notes Tab */}
            <TabsContent value="notes" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-6">
                {/* Terms and Conditions */}
                <FormField control={form.control} name="termsAndConditions" render={({
                field
              }) => <FormItem>
                      <FormLabel>Terms and Conditions</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter terms and conditions" className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                {/* Notes */}
                <FormField control={form.control} name="notes" render={({
                field
              }) => <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter additional notes about this customer" className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>
            </TabsContent>
            
            <Button type="submit" className="mt-4">
              Save Customer
            </Button>
          </form>
        </Form>
      </Tabs>
    </div>;
};
export default CustomerTabs;
