
import React from "react";
import { Edit, Trash2, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { InvoiceRecipient } from "./CompanyForm";

interface CompanyTableProps {
  invoiceRecipients: InvoiceRecipient[];
  isLoading: boolean;
  onEdit: (recipient: InvoiceRecipient) => void;
  onDelete: (id: string, companyName: string) => void;
}

const CompanyTable: React.FC<CompanyTableProps> = ({
  invoiceRecipients,
  isLoading,
  onEdit,
  onDelete
}) => {
  return (
    <>
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
                        onClick={() => onEdit(recipient)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(recipient.id, recipient.company_name)}
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
    </>
  );
};

export default CompanyTable;
