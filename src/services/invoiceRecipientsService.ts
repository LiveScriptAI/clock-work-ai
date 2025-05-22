
import { supabase } from "@/integrations/supabase/client";

export async function fetchInvoiceRecipients() {
  const { data, error } = await supabase
    .from("invoice_recipients")
    .select("id, company_name");
    
  if (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
  
  return data || [];
}

export async function fetchInvoiceRecipientById(id: string) {
  const { data, error } = await supabase
    .from("invoice_recipients")
    .select("*")
    .eq("id", id)
    .single();
    
  if (error) {
    console.error("Error fetching company details:", error);
    throw error;
  }
  
  return data;
}

export async function deleteInvoiceRecipient(id: string) {
  const { error } = await supabase
    .from("invoice_recipients")
    .delete()
    .eq("id", id);
    
  if (error) {
    console.error("Error deleting company:", error);
    throw error;
  }
  
  return true;
}
