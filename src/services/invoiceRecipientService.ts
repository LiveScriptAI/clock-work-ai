
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface InvoiceRecipient {
  id: string;
  user_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone_number?: string;
  address?: string;
  vat_number?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceRecipientData {
  company_name: string;
  contact_name: string;
  email: string;
  phone_number?: string;
  address?: string;
  vat_number?: string;
}

export const fetchInvoiceRecipients = async (): Promise<InvoiceRecipient[]> => {
  try {
    const { data, error } = await supabase
      .from('invoice_recipients')
      .select('*')
      .order('company_name', { ascending: true });

    if (error) {
      console.error('Error fetching invoice recipients:', error);
      toast({
        title: "Error fetching recipients",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchInvoiceRecipients:', error);
    toast({
      title: "Something went wrong",
      description: "Failed to fetch invoice recipients",
      variant: "destructive",
    });
    return [];
  }
};

export const createInvoiceRecipient = async (
  recipientData: CreateInvoiceRecipientData
): Promise<InvoiceRecipient | null> => {
  try {
    const { data, error } = await supabase
      .from('invoice_recipients')
      .insert([recipientData])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating invoice recipient:', error);
      toast({
        title: "Error saving recipient",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Success",
      description: "Recipient saved successfully",
    });

    return data;
  } catch (error) {
    console.error('Error in createInvoiceRecipient:', error);
    toast({
      title: "Something went wrong",
      description: "Failed to save recipient",
      variant: "destructive",
    });
    return null;
  }
};

export const updateInvoiceRecipient = async (
  id: string,
  recipientData: Partial<CreateInvoiceRecipientData>
): Promise<InvoiceRecipient | null> => {
  try {
    const { data, error } = await supabase
      .from('invoice_recipients')
      .update(recipientData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating invoice recipient:', error);
      toast({
        title: "Error updating recipient",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Success",
      description: "Recipient updated successfully",
    });

    return data;
  } catch (error) {
    console.error('Error in updateInvoiceRecipient:', error);
    toast({
      title: "Something went wrong",
      description: "Failed to update recipient",
      variant: "destructive",
    });
    return null;
  }
};

export const deleteInvoiceRecipient = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('invoice_recipients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting invoice recipient:', error);
      toast({
        title: "Error deleting recipient",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Recipient deleted successfully",
    });

    return true;
  } catch (error) {
    console.error('Error in deleteInvoiceRecipient:', error);
    toast({
      title: "Something went wrong",
      description: "Failed to delete recipient",
      variant: "destructive",
    });
    return false;
  }
};
