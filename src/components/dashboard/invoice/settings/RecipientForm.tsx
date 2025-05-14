
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createInvoiceRecipient, updateInvoiceRecipient, InvoiceRecipient } from "@/services/invoiceRecipientService";
import { Loader2 } from "lucide-react";

const recipientSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  contact_name: z.string().min(1, "Contact name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  vat_number: z.string().optional(),
});

type RecipientFormData = z.infer<typeof recipientSchema>;

interface RecipientFormProps {
  existingRecipient?: InvoiceRecipient;
  onComplete: () => void;
}

export function RecipientForm({ existingRecipient, onComplete }: RecipientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!existingRecipient;

  const form = useForm<RecipientFormData>({
    resolver: zodResolver(recipientSchema),
    defaultValues: {
      company_name: existingRecipient?.company_name || "",
      contact_name: existingRecipient?.contact_name || "",
      email: existingRecipient?.email || "",
      phone_number: existingRecipient?.phone_number || "",
      address: existingRecipient?.address || "",
      vat_number: existingRecipient?.vat_number || "",
    },
  });

  const onSubmit = async (data: RecipientFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing && existingRecipient) {
        await updateInvoiceRecipient(existingRecipient.id, data);
      } else {
        await createInvoiceRecipient(data);
      }
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name*</FormLabel>
              <FormControl>
                <Input placeholder="Company name" {...field} />
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
              <FormLabel>Contact Name*</FormLabel>
              <FormControl>
                <Input placeholder="Contact person's name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address*</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
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
                <Input placeholder="Phone number (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Business address (optional)" {...field} />
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
              <FormLabel>VAT Number</FormLabel>
              <FormControl>
                <Input placeholder="VAT number (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onComplete} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Update Recipient' : 'Save Recipient'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
