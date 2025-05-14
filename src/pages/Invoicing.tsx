
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, Edit, Trash2, Eye, Loader } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
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
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  fetchInvoiceRecipients, 
  addInvoiceRecipient, 
  deleteInvoiceRecipient,
  InvoiceRecipient 
} from "@/services/invoiceService";

const formSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  contact_name: z.string().min(1, "Contact name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  vat_number: z.string().optional()
});

type InvoiceFormValues = z.infer<typeof formSchema>;

const InvoicingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<InvoiceRecipient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      contact_name: "",
      email: "",
      phone_number: "",
      address: "",
      vat_number: ""
    }
  });

  // Fetch companies when the component mounts
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    async function loadCompanies() {
      setIsLoading(true);
      try {
        const data = await fetchInvoiceRecipients();
        setCompanies(data);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadCompanies();
  }, [user, navigate]);

  const onSubmit = async (data: InvoiceFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save company information.",
        variant: "destructive"
      });
      return;
    }
    
    // Show loading toast
    const loadingToast = toast({
      title: "Saving...",
      description: "Saving your company information.",
    });
    
    const success = await addInvoiceRecipient({
      company_name: data.company_name,
      contact_name: data.contact_name,
      email: data.email,
      phone_number: data.phone_number,
      address: data.address,
      vat_number: data.vat_number || null
    });
    
    if (success) {
      toast({
        title: "Success",
        description: "Your company information has been saved successfully.",
      });
      
      // Refresh the companies list
      const updatedCompanies = await fetchInvoiceRecipients();
      setCompanies(updatedCompanies);
      
      // Reset form after submission
      form.reset();
    }
  };

  const handleView = (id: string) => {
    console.log("View company", id);
    toast({
      title: "View Company",
      description: `Viewing company with ID: ${id}`,
    });
    // Placeholder for view functionality
  };

  const handleEdit = (id: string) => {
    console.log("Edit company", id);
    toast({
      title: "Edit Company",
      description: `Editing company with ID: ${id}`,
    });
    // Placeholder for edit functionality
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this company?");
    if (!confirmDelete) return;
    
    const success = await deleteInvoiceRecipient(id);
    if (success) {
      toast({
        title: "Company Deleted",
        description: "The company has been deleted successfully.",
      });
      
      // Update local state without refetching
      setCompanies(companies.filter(company => company.id !== id));
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 text-center">
        <p>Please log in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-2xl font-bold mb-6">Invoice Settings</h1>
      
      <Card className="w-full max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Enter your company details to display on invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your company name" {...field} />
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
                      <FormLabel>Contact Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact person" {...field} />
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
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
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
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
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
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Input placeholder="Company address" {...field} />
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
                      <Input placeholder="VAT/Tax identification number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <CardFooter className="flex justify-between px-0">
                <div className="flex gap-2">
                  <Button type="submit" variant="default" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Company List Section */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Company List</CardTitle>
          <CardDescription>
            Your saved companies for invoicing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              You haven't saved any companies yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>VAT Number</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.company_name}</TableCell>
                      <TableCell>{company.contact_name}</TableCell>
                      <TableCell>{company.email}</TableCell>
                      <TableCell>{company.phone_number}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{company.address}</TableCell>
                      <TableCell>{company.vat_number || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(company.id as string)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(company.id as string)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleDelete(company.id as string)}
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
