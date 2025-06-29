
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { load, save } from '@/services/localStorageService';

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
}

export interface ShiftData {
  id: string;
  date: Date;
  employer: string;
  hoursWorked: number;
  payRate: number;
  payType: string;
  earnings: number;
  clientEmail?: string;
  startTime: Date;
  endTime: Date;
  breakDuration: number;
  status: string;
}

interface DataContextType {
  customers: Customer[];
  shifts: ShiftData[];
  refreshCustomers: () => void;
  refreshShifts: () => void;
  addCustomer: (customer: Customer) => void;
  addShift: (shift: ShiftData) => void;
  updateCustomer: (id: string, customer: Customer) => void;
  updateShift: (id: string, shift: ShiftData) => void;
  deleteCustomer: (id: string) => void;
  deleteShift: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [shifts, setShifts] = useState<ShiftData[]>([]);

  const refreshCustomers = () => {
    const savedCustomers = load<Customer[]>('invoiceRecipients') || [];
    setCustomers(savedCustomers);
  };

  const refreshShifts = () => {
    const savedShifts = load<ShiftData[]>('shifts') || [];
    setShifts(savedShifts);
  };

  const addCustomer = (customer: Customer) => {
    const updatedCustomers = [...customers, customer];
    setCustomers(updatedCustomers);
    save('invoiceRecipients', updatedCustomers);
  };

  const addShift = (shift: ShiftData) => {
    const updatedShifts = [...shifts, shift];
    setShifts(updatedShifts);
    save('shifts', updatedShifts);
  };

  const updateCustomer = (id: string, customer: Customer) => {
    const updatedCustomers = customers.map(c => c.id === id ? customer : c);
    setCustomers(updatedCustomers);
    save('invoiceRecipients', updatedCustomers);
  };

  const updateShift = (id: string, shift: ShiftData) => {
    const updatedShifts = shifts.map(s => s.id === id ? shift : s);
    setShifts(updatedShifts);
    save('shifts', updatedShifts);
  };

  const deleteCustomer = (id: string) => {
    const updatedCustomers = customers.filter(c => c.id !== id);
    setCustomers(updatedCustomers);
    save('invoiceRecipients', updatedCustomers);
  };

  const deleteShift = (id: string) => {
    const updatedShifts = shifts.filter(s => s.id !== id);
    setShifts(updatedShifts);
    save('shifts', updatedShifts);
  };

  // Load initial data
  useEffect(() => {
    refreshCustomers();
    refreshShifts();
  }, []);

  // Listen for custom events for cross-component updates
  useEffect(() => {
    const handleCustomerUpdate = () => refreshCustomers();
    const handleShiftUpdate = () => refreshShifts();

    window.addEventListener('customerDataUpdated', handleCustomerUpdate);
    window.addEventListener('shiftDataUpdated', handleShiftUpdate);

    return () => {
      window.removeEventListener('customerDataUpdated', handleCustomerUpdate);
      window.removeEventListener('shiftDataUpdated', handleShiftUpdate);
    };
  }, []);

  return (
    <DataContext.Provider value={{
      customers,
      shifts,
      refreshCustomers,
      refreshShifts,
      addCustomer,
      addShift,
      updateCustomer,
      updateShift,
      deleteCustomer,
      deleteShift
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
