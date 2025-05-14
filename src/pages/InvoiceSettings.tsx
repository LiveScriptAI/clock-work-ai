
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  fetchInvoiceRecipients, 
  InvoiceRecipient 
} from "@/services/invoiceRecipientService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RecipientForm } from "@/components/dashboard/invoice/settings/RecipientForm";
import { DeleteRecipientDialog } from "@/components/dashboard/invoice/settings/DeleteRecipientDialog";
import { EditRecipientDialog } from "@/components/dashboard/invoice/settings/EditRecipientDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Plus, Trash2 } from "lucide-react";

export default function InvoiceSettings() {
  const { user } = useAuth();
  const [recipients, setRecipients] = useState<InvoiceRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [deleteDialogState, setDeleteDialogState] = useState({
    isOpen: false,
    recipientId: "",
    recipientName: ""
  });
  
  const [editDialogState, setEditDialogState] = useState<{
    isOpen: boolean;
    recipient: InvoiceRecipient | null;
  }>({
    isOpen: false,
    recipient: null
  });

  const loadRecipients = async () => {
    setIsLoading(true);
    try {
      const data = await fetchInvoiceRecipients();
      setRecipients(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadRecipients();
    }
  }, [user]);

  const openDeleteDialog = (id: string, name: string) => {
    setDeleteDialogState({
      isOpen: true,
      recipientId: id,
      recipientName: name
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialogState({
      isOpen: false,
      recipientId: "",
      recipientName: ""
    });
  };

  const openEditDialog = (recipient: InvoiceRecipient) => {
    setEditDialogState({
      isOpen: true,
      recipient
    });
  };

  const closeEditDialog = () => {
    setEditDialogState({
      isOpen: false,
      recipient: null
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoice Recipients</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your saved recipient information for invoicing
          </p>
        </div>
        <Button 
          className="mt-4 sm:mt-0" 
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Recipient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Recipients</CardTitle>
          <CardDescription>
            View and manage your saved invoice recipients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recipients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              {isLoading ? (
                <p>Loading recipients...</p>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">
                    You don't have any saved recipients yet
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Recipient
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipients.map((recipient) => (
                    <TableRow key={recipient.id}>
                      <TableCell className="font-medium">{recipient.company_name}</TableCell>
                      <TableCell>{recipient.contact_name}</TableCell>
                      <TableCell className="hidden md:table-cell">{recipient.email}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(recipient)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only md:not-sr-only md:ml-2">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => openDeleteDialog(recipient.id, recipient.company_name)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only md:not-sr-only md:ml-2">Delete</span>
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

      {/* Add New Recipient Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Recipient</DialogTitle>
          </DialogHeader>
          <RecipientForm 
            onComplete={() => {
              loadRecipients();
              setIsAddDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Recipient Dialog */}
      {editDialogState.recipient && (
        <EditRecipientDialog
          isOpen={editDialogState.isOpen}
          onClose={closeEditDialog}
          recipient={editDialogState.recipient}
          onUpdated={loadRecipients}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteRecipientDialog
        isOpen={deleteDialogState.isOpen}
        onClose={closeDeleteDialog}
        recipientId={deleteDialogState.recipientId}
        recipientName={deleteDialogState.recipientName}
        onDeleted={loadRecipients}
      />
    </div>
  );
}
