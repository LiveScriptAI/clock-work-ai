
import React from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

// Define the form schema with Zod
const formSchema = z.object({
  businessName: z.string().min(1, { message: "Business name is required" }),
  contactName: z.string().min(1, { message: "Contact name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  // Payment Details Tab fields
  paymentTerms: z.string().optional(),
  creditTerms: z.number().optional().or(z.string().optional()),
  termsAndConditions: z.string().optional(),
  bankAccountName: z.string().optional(),
  sortCode: z.string().optional(),
  accountNumber: z.string().optional(),
  bicSwift: z.string().optional(),
  iban: z.string().optional(),
  // Notes Tab field
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CustomerTabs = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize react-hook-form with zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      contactName: "",
      email: "",
      address: "",
      phoneNumber: "",
      vatNumber: "",
      // Payment Details defaults
      paymentTerms: "",
      creditTerms: "",
      termsAndConditions: "",
      bankAccountName: "",
      sortCode: "",
      accountNumber: "",
      bicSwift: "",
      iban: "",
      // Notes default
      notes: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save customer data",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert creditTerms to number if it's a string
      const creditTermsValue = data.creditTerms ? 
        typeof data.creditTerms === 'string' ? parseFloat(data.creditTerms as string) || null : data.creditTerms : 
        null;

      // Map form data to database fields
      const payload = {
        user_id: user.id,
        company_name: data.businessName,
        contact_name: data.contactName,
        email: data.email,
        address: data.address || null,
        phone_number: data.phoneNumber || null,
        vat_number: data.vatNumber || null,
        // Payment Details fields
        payment_terms: data.paymentTerms || null,
        credit_terms: creditTermsValue,
        terms_conditions: data.termsAndConditions || null,
        bank_account_name: data.bankAccountName || null,
        sort_code: data.sortCode || null,
        account_number: data.accountNumber || null,
        bic_swift: data.bicSwift || null,
        iban: data.iban || null,
        // Notes field
        notes: data.notes || null,
      };

      // Save to Supabase
      const { error } = await supabase.from("invoice_recipients").insert([payload]);

      if (error) {
        console.error("Error saving customer:", error);
        toast({
          title: "Error",
          description: "Failed to save customer information",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Customer information saved successfully",
        });
        form.reset();
      }
    } catch (error) {
      console.error("Error in customer save:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-md shadow-sm">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Customer Information</h2>
        <p className="text-sm text-muted-foreground">
          Enter customer details to be used in your invoices
        </p>
      </div>

      <Tabs defaultValue="customer-details" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="customer-details">Customer Details</TabsTrigger>
          <TabsTrigger value="payment-details">Payment Details</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Customer Details Tab */}
            <TabsContent value="customer-details" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Name */}
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter business name" {...field} />
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
                        <Input placeholder="Enter contact name" {...field} />
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
                        <Input placeholder="Enter email address" type="email" {...field} />
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
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
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
                        <Input placeholder="Enter VAT number" {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter address" {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
            
            {/* Payment Details Tab */}
            <TabsContent value="payment-details" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Terms */}
                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Net 30" {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Credit Terms */}
                <FormField
                  control={form.control}
                  name="creditTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Terms</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter credit limit" type="number" {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Bank Account Name */}
                <FormField
                  control={form.control}
                  name="bankAccountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter bank account name" {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Sort Code */}
                <FormField
                  control={form.control}
                  name="sortCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 12-34-56" {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Account Number */}
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter account number" {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* BIC/SWIFT */}
                <FormField
                  control={form.control}
                  name="bicSwift"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BIC/SWIFT</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter BIC/SWIFT code" {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* IBAN */}
                <FormField
                  control={form.control}
                  name="iban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IBAN</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter IBAN" {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Terms and Conditions */}
                <FormField
                  control={form.control}
                  name="termsAndConditions"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Terms and Conditions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter terms and conditions" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
            
            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-6">
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
                          className="min-h-[200px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
            
            <Button type="submit" className="mt-4">
              Save Customer
            </Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default CustomerTabs;
