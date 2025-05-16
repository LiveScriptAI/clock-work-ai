
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Company {
  id: string;
  company_name: string;
}

interface CompanySelectorProps {
  onSelect: (company: any) => void;
}

const CompanySelector = ({ onSelect }: CompanySelectorProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("invoice_recipients")
          .select("id, company_name");

        if (error) {
          console.error("Error fetching companies:", error);
          return;
        }

        setCompanies(data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleCompanySelect = async (companyId: string) => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from("invoice_recipients")
        .select("*")
        .eq("id", companyId)
        .single();

      if (error) {
        console.error("Error fetching company details:", error);
        return;
      }

      if (data) {
        onSelect(data);
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
    }
  };

  return (
    <div className="mb-6 space-y-2">
      <Label htmlFor="company-selector">Load Company</Label>
      <Select onValueChange={handleCompanySelect} disabled={isLoading}>
        <SelectTrigger className="w-full" id="company-selector">
          <SelectValue placeholder="Select a company" />
        </SelectTrigger>
        <SelectContent>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.company_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CompanySelector;
