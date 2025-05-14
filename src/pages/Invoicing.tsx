
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, Edit, Trash2, Eye } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  vatNumber: z.string().optional()
});

type InvoiceFormValues = z.infer<typeof formSchema>;

// Define the company type to match what's expected
interface Company {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  vatNumber?: string;
}

// Updated placeholder company data with all required fields
const initialCompanies: Company[] = [
  {
    id: 1,
    companyName: "Acme Inc.",
    contactName: "John Doe",
    email: "john@acme.com",
    phone: "123-456-7890",
    address: "123 Main St, City",
    vatNumber: "VAT123456"
  },
  {
    id: 2,
    companyName: "Tech Solutions",
    contactName: "Jane Smith",
    email: "jane@techsolutions.com",
    phone: "987-654-3210",
    address: "456 Tech Ave, Town",
    vatNumber: "VAT654321"
  }
];

const InvoicingPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      vatNumber: ""
    }
  });

  const onSubmit = (data: InvoiceFormValues) => {
    console.log(data);
    toast({
      title: "Invoice settings saved",
      description: "Your invoice settings have been saved successfully.",
    });
    
    // Ensure all required fields have values when adding a new company
    const newCompany: Company = {
      id: companies.length + 1,
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone || "", // Convert optional string to empty string if undefined
      address: data.address || "", // Convert optional string to empty string if undefined
      vatNumber: data.vatNumber // This can remain optional
    };
    
    // Add the new company to the list
    setCompanies([...companies, newCompany]);
    
    // Reset form after submission
    form.reset();
  };

  const handleView = (id: number) => {
    console.log("View company", id);
    toast({
      title: "View Company",
      description: `Viewing company with ID: ${id}`,
    });
  };

  const handleEdit = (id: number) => {
    console.log("Edit company", id);
    toast({
      title: "Edit Company",
      description: `Editing company with ID: ${id}`,
    });
  };

  const handleDelete = (id: number) => {
    console.log("Delete company", id);
    toast({
      title: "Delete Company",
      description: `Deleting company with ID: ${id}`,
    });
  };

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
                  name="companyName"
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
                  name="contactName"
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
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
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Company address" {...field} />
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
                  <Button type="submit" variant="default">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button type="button" variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
                <Button type="button" variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
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
          {companies.length === 0 ? (
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
                    <TableHead>VAT Number</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.companyName}</TableCell>
                      <TableCell>{company.contactName}</TableCell>
                      <TableCell>{company.email}</TableCell>
                      <TableCell>{company.phone || "-"}</TableCell>
                      <TableCell>{company.vatNumber || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(company.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(company.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleDelete(company.id)}
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
