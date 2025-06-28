
import { load, save } from '@/services/localStorageService';

export interface InvoiceRecipient {
  id: string;
  company_name: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  notes?: string;
  terms_conditions?: string;
}

const RECIPIENTS_KEY = 'invoiceRecipients';

export function fetchInvoiceRecipients(): Promise<InvoiceRecipient[]> {
  return Promise.resolve(load<InvoiceRecipient[]>(RECIPIENTS_KEY) || []);
}

export function fetchInvoiceRecipientById(id: string): Promise<InvoiceRecipient | null> {
  const recipients = load<InvoiceRecipient[]>(RECIPIENTS_KEY) || [];
  const recipient = recipients.find(r => r.id === id);
  return Promise.resolve(recipient || null);
}

export function saveInvoiceRecipient(data: Omit<InvoiceRecipient, 'id'>): Promise<InvoiceRecipient> {
  const recipients = load<InvoiceRecipient[]>(RECIPIENTS_KEY) || [];
  const newRecipient = { ...data, id: `recipient-${Date.now()}` };
  recipients.push(newRecipient);
  save(RECIPIENTS_KEY, recipients);
  return Promise.resolve(newRecipient);
}

export function deleteInvoiceRecipient(id: string): Promise<void> {
  const recipients = load<InvoiceRecipient[]>(RECIPIENTS_KEY) || [];
  const filtered = recipients.filter(r => r.id !== id);
  save(RECIPIENTS_KEY, filtered);
  return Promise.resolve();
}
