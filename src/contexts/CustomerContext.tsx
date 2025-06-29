
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { load, save } from '@/services/localStorageService';
import { getUserId } from '@/utils/userId';

export interface Customer {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  phone_number?: string;
  vat_number?: string;
  terms_conditions?: string;
  notes?: string;
  created_at: string;
}

interface CustomerContextType {
  customers: Customer[];
  refreshCustomers: () => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at'>) => Customer;
  deleteCustomer: (id: string) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};

interface CustomerProviderProps {
  children: ReactNode;
}

export const CustomerProvider = ({ children }: CustomerProviderProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const refreshCustomers = () => {
    // Use user-scoped key for saved customers
    const savedCustomers = load<Customer[]>('savedCustomers') || [];
    setCustomers(savedCustomers);
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'created_at'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };

    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    
    // Save to user-scoped storage
    save('savedCustomers', updatedCustomers);
    
    // Also maintain compatibility with invoice recipients format
    const invoiceRecipients = updatedCustomers.map(customer => ({
      id: customer.id,
      company_name: customer.company_name,
      email: customer.email,
      address1: customer.address1,
      address2: customer.address2,
      city: customer.city,
      county: customer.county,
      postcode: customer.postcode,
      country: customer.country,
      notes: customer.notes,
      terms_conditions: customer.terms_conditions
    }));
    save('invoiceRecipients', invoiceRecipients);

    return newCustomer;
  };

  const deleteCustomer = (id: string) => {
    const updatedCustomers = customers.filter(customer => customer.id !== id);
    setCustomers(updatedCustomers);
    save('savedCustomers', updatedCustomers);
    
    // Also update invoice recipients
    const invoiceRecipients = updatedCustomers.map(customer => ({
      id: customer.id,
      company_name: customer.company_name,
      email: customer.email,
      address1: customer.address1,
      address2: customer.address2,
      city: customer.city,
      county: customer.county,
      postcode: customer.postcode,
      country: customer.country,
      notes: customer.notes,
      terms_conditions: customer.terms_conditions
    }));
    save('invoiceRecipients', invoiceRecipients);
  };

  useEffect(() => {
    refreshCustomers();
  }, []);

  return (
    <CustomerContext.Provider value={{
      customers,
      refreshCustomers,
      addCustomer,
      deleteCustomer
    }}>
      {children}
    </CustomerContext.Provider>
  );
};
