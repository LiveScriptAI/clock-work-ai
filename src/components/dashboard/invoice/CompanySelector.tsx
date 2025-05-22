
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
import {
  fetchInvoiceRecipients,
  fetchInvoiceRecipientById,
  deleteInvoiceRecipient
} from "@/services/invoiceRecipientsService";
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

interface Company {
  id: string;
  company_name: string;
}

interface CompanySelectorProps {
  onSelect: (company: any) => void;
}

const CompanySelector = ({ onSelect }: CompanySelectorProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const data = await fetchInvoiceRecipients();
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCompanySelect = async (companyId: string) => {
    if (!companyId) return;
    
    setSelectedCompanyId(companyId);
    
    try {
      const data = await fetchInvoiceRecipientById(companyId);
      if (data) {
        onSelect(data);
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
      toast({
        title: "Error",
        description: "Failed to load company details",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompanyId) return;
    
    try {
      await deleteInvoiceRecipient(selectedCompanyId);
      
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
      
      // Reset selection and refresh the list
      setSelectedCompanyId(null);
      fetchCompanies();
      
      // Close the dialog
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting company:", error);
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mb-6 space-y-2">
      <Label htmlFor="company-selector">Load Company</Label>
      <div className="flex items-center">
        <Select 
          onValueChange={handleCompanySelect} 
          disabled={isLoading}
          value={selectedCompanyId || undefined}
        >
          <SelectTrigger className="w-full" id="company-selector">
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.company_name}
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
              <span className="sr-only">Delete company</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete company?</AlertDialogTitle>
              <AlertDialogDescription>
                Permanently delete this contact and all its details? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteCompany}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Company
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default CompanySelector;
