
import { supabase } from "@/integrations/supabase/client";

export type InvoiceSettingsType = {
  id?: string;
  business_name: string;
  address1: string;
  address2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  logo_url?: string;
};

export async function upsertInvoiceSettings(
  userId: string,
  data: InvoiceSettingsType
) {
  const response = await supabase
    .from('invoice_settings')
    .upsert({ user_id: userId, ...data }, { onConflict: 'user_id' });
    
  if (response.error) {
    console.error("upsertInvoiceSettings error:", response.error);
    throw response.error;
  }
  
  return response;
}

export async function fetchInvoiceSettings(userId: string) {
  const { data, error } = await supabase
    .from('invoice_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching invoice settings:", error);
  }
  
  return data;
}
