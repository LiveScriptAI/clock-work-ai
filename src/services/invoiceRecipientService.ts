
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceRecipient } from "@/components/invoicing/CompanyForm";

export const fetchInvoiceRecipients = async (): Promise<InvoiceRecipient[]> => {
  try {
    const { data, error } = await supabase
      .from("invoice_recipients")
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching invoice recipients:", error);
    toast.error("Failed to load companies");
    return [];
  }
};

export const deleteInvoiceRecipient = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("invoice_recipients")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    
    toast.success("Company deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting invoice recipient:", error);
    toast.error("Failed to delete company");
    return false;
  }
};
