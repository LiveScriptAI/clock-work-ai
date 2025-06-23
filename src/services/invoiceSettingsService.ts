
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
  console.log("Attempting to upsert invoice settings for user:", userId, data);
  
  try {
    const response = await supabase
      .from('invoice_settings')
      .upsert({ user_id: userId, ...data }, { onConflict: 'user_id' })
      .select();
      
    console.log("Upsert response:", response);
    
    if (response.error) {
      console.error("upsertInvoiceSettings error:", response.error);
      throw new Error(`Failed to save invoice settings: ${response.error.message}`);
    }
    
    return response;
  } catch (error) {
    console.error("Exception in upsertInvoiceSettings:", error);
    throw error;
  }
}

export async function fetchInvoiceSettings(userId: string) {
  console.log("Fetching invoice settings for user:", userId);
  
  try {
    const { data, error } = await supabase
      .from('invoice_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    console.log("Fetch response:", { data, error });
    
    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching invoice settings:", error);
      throw new Error(`Failed to fetch invoice settings: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error("Exception in fetchInvoiceSettings:", error);
    return null;
  }
}
