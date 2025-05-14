
import React, { useEffect, useState } from "react";
import Navigation from "@/components/dashboard/Navigation";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent
} from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import CompanyForm, { InvoiceRecipient } from "@/components/invoicing/CompanyForm";
import CompanyTable from "@/components/invoicing/CompanyTable";
import { fetchInvoiceRecipients, deleteInvoiceRecipient } from "@/services/invoiceRecipientService";

const InvoicingPage: React.FC = () => {
  const [invoiceRecipients, setInvoiceRecipients] = useState<InvoiceRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRecipient, setEditingRecipient] = useState<InvoiceRecipient | null>(null);

  const loadCompanies = async () => {
    setIsLoading(true);
    const data = await fetchInvoiceRecipients();
    setInvoiceRecipients(data);
    setIsLoading(false);
  };

  const handleCompanyAdded = (newRecipient: InvoiceRecipient) => {
    setInvoiceRecipients(prev => [...prev, newRecipient]);
  };

  const handleCompanyUpdated = (updatedRecipient: InvoiceRecipient) => {
    setInvoiceRecipients(prev => 
      prev.map(item => 
        item.id === updatedRecipient.id 
          ? updatedRecipient
          : item
      )
    );
  };

  const handleEdit = (recipient: InvoiceRecipient) => {
    setEditingRecipient(recipient);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string, companyName: string) => {
    if (window.confirm(`Are you sure you want to delete ${companyName}?`)) {
      deleteInvoiceRecipient(id).then(success => {
        if (success) {
          setInvoiceRecipients(prev => prev.filter(item => item.id !== id));
        }
      });
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Navigation Component */}
      <Navigation />
      
      <Card>
        <CardHeader>
          <CardTitle>
            {editingRecipient ? "Edit Company Information" : "Company Information"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyForm
            editingRecipient={editingRecipient}
            setEditingRecipient={setEditingRecipient}
            onCompanyAdded={handleCompanyAdded}
            onCompanyUpdated={handleCompanyUpdated}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company List</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyTable
            invoiceRecipients={invoiceRecipients}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicingPage;
