import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface InvoiceRecipient {
  id?: string; // UUID - optional for new records
  user_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone_number: string;
  address: string;
  vat_number?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch all invoice recipients for the current user
 */
export async function fetchInvoiceRecipients(): Promise<InvoiceRecipient[]> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) {
      throw new Error("No authenticated user found");
    }

    const { data, error } = await supabase
      .from("invoice_recipients")
      .select("*")
      // No need to filter by user_id as RLS will handle this
      .order("company_name");

    if (error) {
      console.error("Error fetching invoice recipients:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch invoice recipients:", error);
    toast({
      title: "Error",
      description: "Failed to fetch companies. Please try again.",
      variant: "destructive",
    });
    return [];
  }
}

/**
 * Add a new invoice recipient
 */
export async function addInvoiceRecipient(data: {
  user_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone_number: string;
  address: string;
  vat_number?: string | null;
}): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("invoice_recipients")
      .insert(data); // Pass the object directly, not [data]

    if (error) {
      console.error("Error adding invoice recipient:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Failed to add invoice recipient:", error);
    toast({
      title: "Error",
      description: "Failed to save company. Please try again.",
      variant: "destructive",
    });
    return false;
  }
}

/**
 * Delete an invoice recipient
 */
export async function deleteInvoiceRecipient(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("invoice_recipients")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting invoice recipient:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Failed to delete invoice recipient:", error);
    toast({
      title: "Error",
      description: "Failed to delete company. Please try again.",
      variant: "destructive",
    });
    return false;
  }
}
