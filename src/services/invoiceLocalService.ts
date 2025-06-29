
import { load, save } from '@/services/localStorageService';

export interface InvoiceSettingsType {
  id?: string;
  business_name: string;
  contact_name: string;
  address1: string;
  address2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  logo_url?: string;
}

const SETTINGS_KEY = 'invoiceSettings';

export function fetchInvoiceSettings(): Promise<InvoiceSettingsType | null> {
  try {
    // Try multiple storage keys for backwards compatibility
    let data = load<InvoiceSettingsType>(SETTINGS_KEY);
    
    // If not found, try the key used by MyCompanyForm
    if (!data) {
      data = load<InvoiceSettingsType>('companySettings');
    }
    
    // If still not found, try without the user prefix (for migration)
    if (!data) {
      try {
        const rawData = localStorage.getItem('companySettings');
        if (rawData) {
          data = JSON.parse(rawData);
        }
      } catch (e) {
        console.warn('Could not parse fallback company settings:', e);
      }
    }
    
    console.log('Fetched invoice settings:', data);
    return Promise.resolve(data);
  } catch (error) {
    console.error('Failed to fetch invoice settings:', error);
    return Promise.resolve(null);
  }
}

export function saveInvoiceSettings(data: Omit<InvoiceSettingsType, 'id'>): Promise<InvoiceSettingsType> {
  try {
    const settingsWithId = { ...data, id: 'local-settings' };
    
    // Save to both keys for compatibility
    save(SETTINGS_KEY, settingsWithId);
    save('companySettings', settingsWithId);
    
    console.log('Saved invoice settings:', settingsWithId);
    return Promise.resolve(settingsWithId);
  } catch (error) {
    console.error('Failed to save invoice settings:', error);
    throw error;
  }
}
