
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

// Define the form schema with validation
const formSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  contact_name: z.string().min(1, "Contact name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  vat_number: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;
export type InvoiceRecipient = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone_number: string | null;
  address: string | null;
  vat_number: string | null;
  user_id: string;
};

interface CompanyFormProps {
  editingRecipient: InvoiceRecipient | null;
  setEditingRecipient: React.Dispatch<React.SetStateAction<InvoiceRecipient | null>>;
  onCompanyAdded: (recipient: InvoiceRecipient) => void;
  onCompanyUpdated: (recipient: InvoiceRecipient) => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({
  editingRecipient,
  setEditingRecipient,
  onCompanyAdded,
  onCompanyUpdated
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: editingRecipient?.company_name || "",
      contact_name: editingRecipient?.contact_name || "",
      email: editingRecipient?.email || "",
      phone_number: editingRecipient?.phone_number || "",
      address: editingRecipient?.address || "",
      vat_number: editingRecipient?.vat_number || "",
    },
  });

  const addInvoiceRecipient = async (formData: FormValues) => {
    setIsSubmitting(true);
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to add a company");
        return;
      }
      
      if (editingRecipient) {
        // Update existing recipient
        const { error } = await supabase
          .from("invoice_recipients")
          .update({
            user_id: user.id,
            company_name: formData.company_name,
            contact_name: formData.contact_name,
            email: formData.email,
            phone_number: formData.phone_number,
            address: formData.address,
            vat_number: formData.vat_number || null
          })
          .eq("id", editingRecipient.id);

        if (error) throw new Error(error.message);

        const updatedRecipient = { 
          ...editingRecipient, 
          ...formData, 
          user_id: user.id 
        };
        
        onCompanyUpdated(updatedRecipient);
        toast.success("Company updated successfully");
        setEditingRecipient(null);
      } else {
        // Add new recipient
        const { data, error } = await supabase
          .from("invoice_recipients")
          .insert({
            user_id: user.id,
            company_name: formData.company_name,
            contact_name: formData.contact_name,
            email: formData.email,
            phone_number: formData.phone_number,
            address: formData.address,
            vat_number: formData.vat_number || null
          })
          .select();

        if (error) throw new Error(error.message);

        if (data && data.length > 0) {
          onCompanyAdded(data[0]);
          toast.success("Company added successfully");
        }
      }

      form.reset({
        company_name: "",
        contact_name: "",
        email: "",
        phone_number: "",
        address: "",
        vat_number: "",
      });
    } catch (error) {
      console.error("Error adding/updating invoice recipient:", error);
      toast.error(
        editingRecipient 
          ? "Failed to update company" 
          : "Failed to add company"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(addInvoiceRecipient)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact person name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
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
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter full address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vat_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VAT Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter VAT number if applicable" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              {editingRecipient ? "Updating..." : "Saving..."}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {editingRecipient ? "Update Company" : "Save Company"}
            </>
          )}
        </Button>
        
        {editingRecipient && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setEditingRecipient(null);
              form.reset({
                company_name: "",
                contact_name: "",
                email: "",
                phone_number: "",
                address: "",
                vat_number: "",
              });
            }}
            className="ml-2"
          >
            Cancel Edit
          </Button>
        )}
      </form>
    </Form>
  );
};

export default CompanyForm;
