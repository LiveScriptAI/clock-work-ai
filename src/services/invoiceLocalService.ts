
import { load, save } from '@/services/localStorageService';

export interface InvoiceSettingsType {
  id?: string;
  business_name: string;
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
  return Promise.resolve(load<InvoiceSettingsType>(SETTINGS_KEY));
}

export function saveInvoiceSettings(data: Omit<InvoiceSettingsType, 'id'>): Promise<InvoiceSettingsType> {
  const settingsWithId = { ...data, id: 'local-settings' };
  save(SETTINGS_KEY, settingsWithId);
  return Promise.resolve(settingsWithId);
}
