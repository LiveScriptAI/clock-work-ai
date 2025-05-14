
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, Edit, Trash2, Loader, Save } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
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

type FormValues = z.infer<typeof formSchema>;

type InvoiceRecipient = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone_number: string | null;
  address: string | null;
  vat_number: string | null;
};

const InvoicingPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceRecipients, setInvoiceRecipients] = useState<InvoiceRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRecipient, setEditingRecipient] = useState<InvoiceRecipient | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      contact_name: "",
      email: "",
      phone_number: "",
      address: "",
      vat_number: "",
    },
  });

  const fetchInvoiceRecipients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoice_recipients")
        .select("*");

      if (error) {
        throw new Error(error.message);
      }

      setInvoiceRecipients(data || []);
    } catch (error) {
      console.error("Error fetching invoice recipients:", error);
      toast.error("Failed to load companies");
    } finally {
      setIsLoading(false);
    }
  };

  const addInvoiceRecipient = async (formData: FormValues) => {
    setIsSubmitting(true);
    try {
      if (editingRecipient) {
        // Update existing recipient
        const { error } = await supabase
          .from("invoice_recipients")
          .update(formData)
          .eq("id", editingRecipient.id);

        if (error) throw new Error(error.message);

        setInvoiceRecipients(prev => 
          prev.map(item => 
            item.id === editingRecipient.id 
              ? { ...item, ...formData } 
              : item
          )
        );
        toast.success("Company updated successfully");
        setEditingRecipient(null);
      } else {
        // Add new recipient
        const { data, error } = await supabase
          .from("invoice_recipients")
          .insert([formData])
          .select();

        if (error) throw new Error(error.message);

        if (data && data.length > 0) {
          setInvoiceRecipients(prev => [...prev, data[0]]);
          toast.success("Company added successfully");
        }
      }

      form.reset();
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

  const deleteInvoiceRecipient = async (id: string) => {
    try {
      const { error } = await supabase
        .from("invoice_recipients")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);

      setInvoiceRecipients(prev => prev.filter(item => item.id !== id));
      toast.success("Company deleted successfully");
    } catch (error) {
      console.error("Error deleting invoice recipient:", error);
      toast.error("Failed to delete company");
    }
  };

  const handleView = (recipient: InvoiceRecipient) => {
    // In a real app, this might open a modal or navigate to a detail page
    console.log("View recipient:", recipient);
    toast.info(`Viewing ${recipient.company_name}`);
  };

  const handleEdit = (recipient: InvoiceRecipient) => {
    setEditingRecipient(recipient);
    form.reset({
      company_name: recipient.company_name,
      contact_name: recipient.contact_name,
      email: recipient.email,
      phone_number: recipient.phone_number || "",
      address: recipient.address || "",
      vat_number: recipient.vat_number || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string, companyName: string) => {
    if (window.confirm(`Are you sure you want to delete ${companyName}?`)) {
      deleteInvoiceRecipient(id);
    }
  };

  useEffect(() => {
    fetchInvoiceRecipients();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingRecipient ? "Edit Company Information" : "Company Information"}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <Loader className="h-6 w-6 animate-spin" />
            </div>
          ) : invoiceRecipients.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              You haven't saved any companies yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>VAT Number</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceRecipients.map((recipient) => (
                    <TableRow key={recipient.id}>
                      <TableCell className="font-medium">{recipient.company_name}</TableCell>
                      <TableCell>{recipient.contact_name}</TableCell>
                      <TableCell>{recipient.email}</TableCell>
                      <TableCell>{recipient.phone_number}</TableCell>
                      <TableCell className="max-w-xs truncate">{recipient.address}</TableCell>
                      <TableCell>{recipient.vat_number || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(recipient)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(recipient)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(recipient.id, recipient.company_name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicingPage;
