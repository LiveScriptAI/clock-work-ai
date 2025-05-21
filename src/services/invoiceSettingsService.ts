
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
};

export async function upsertInvoiceSettings(
  userId: string,
  data: InvoiceSettingsType
) {
  return supabase
    .from('invoice_settings')
    .upsert({ user_id: userId, ...data }, { onConflict: 'user_id' });
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
