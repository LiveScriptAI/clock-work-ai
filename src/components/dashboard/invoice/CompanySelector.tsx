
import React, { useState, useEffect } from "react";
import { Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCustomers } from "@/contexts/CustomerContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface InvoiceRecipient {
  id: string;
  company_name: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  notes?: string;
  terms_conditions?: string;
}

interface CompanySelectorProps {
  onSelect: (company: InvoiceRecipient) => void;
}

const CompanySelector = ({ onSelect }: CompanySelectorProps) => {
  const { customers, deleteCustomer } = useCustomers();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCompanySelect = (companyId: string) => {
    if (!companyId) return;
    
    setSelectedCompanyId(companyId);
    
    const selectedCustomer = customers.find(c => c.id === companyId);
    if (selectedCustomer) {
      // Convert to InvoiceRecipient format
      const invoiceRecipient: InvoiceRecipient = {
        id: selectedCustomer.id,
        company_name: selectedCustomer.company_name,
        email: selectedCustomer.email,
        address1: selectedCustomer.address1,
        address2: selectedCustomer.address2,
        city: selectedCustomer.city,
        county: selectedCustomer.county,
        postcode: selectedCustomer.postcode,
        country: selectedCustomer.country,
        notes: selectedCustomer.notes,
        terms_conditions: selectedCustomer.terms_conditions
      };
      onSelect(invoiceRecipient);
    }
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompanyId) return;
    
    try {
      deleteCustomer(selectedCompanyId);
      
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      
      // Reset selection and close dialog
      setSelectedCompanyId(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mb-6 space-y-2">
      <Label htmlFor="company-selector">Load Customer</Label>
      <div className="flex items-center">
        <Select 
          onValueChange={handleCompanySelect} 
          value={selectedCompanyId || undefined}
        >
          <SelectTrigger className="w-full" id="company-selector">
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              disabled={!selectedCompanyId}
              className="ml-2 hidden md:flex"
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete customer</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete customer?</AlertDialogTitle>
              <AlertDialogDescription>
                Permanently delete this customer and all their details? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteCompany}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Customer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default CompanySelector;
