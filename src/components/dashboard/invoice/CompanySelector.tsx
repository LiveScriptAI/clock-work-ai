
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";

interface CompanySelectorProps {
  onSelect: (companyData: any) => void;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({ onSelect }) => {
  const { customers, refreshCustomers } = useData();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  // Refresh customers when component mounts
  useEffect(() => {
    refreshCustomers();
  }, [refreshCustomers]);

  const handleSelect = () => {
    if (!selectedCustomerId) return;
    
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    if (selectedCustomer) {
      onSelect(selectedCustomer);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Load Existing Customer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a customer..." />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto bg-white border border-gray-200 shadow-lg z-50">
            {customers.length === 0 ? (
              <div className="p-2 text-sm text-gray-500">No customers found</div>
            ) : (
              customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  <div className="flex flex-col">
                    <div className="font-medium">{customer.company_name}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        
        <Button 
          onClick={handleSelect} 
          disabled={!selectedCustomerId}
          className="w-full"
        >
          Load Customer Details
        </Button>
        
        <Button 
          variant="outline" 
          onClick={refreshCustomers}
          className="w-full"
        >
          Refresh Customer List
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompanySelector;
