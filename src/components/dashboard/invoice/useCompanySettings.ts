
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { 
  InvoiceSettingsType, 
  fetchInvoiceSettings, 
  upsertInvoiceSettings 
} from "@/services/invoiceSettingsService";

export const useCompanySettings = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const form = useForm<InvoiceSettingsType>({
    defaultValues: {
      business_name: "",
      address1: "",
      address2: "",
      city: "",
      county: "",
      postcode: "",
      country: "",
      logo_url: ""
    }
  });
  
  // Fetch existing settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id || authLoading) return;
      
      setIsLoading(true);
      try {
        console.log("Loading settings for user:", user.id);
        const data = await fetchInvoiceSettings(user.id);
        if (data) {
          console.log("Loaded settings:", data);
          // Reset form with fetched data
          form.reset({
            business_name: data.business_name || "",
            address1: data.address1 || "",
            address2: data.address2 || "",
            city: data.city || "",
            county: data.county || "",
            postcode: data.postcode || "",
            country: data.country || "",
            logo_url: data.logo_url || ""
          });
          
          // Set preview URL if logo exists
          if (data.logo_url) {
            setPreviewUrl(data.logo_url);
          }
        }
      } catch (error) {
        console.error("Failed to load company settings:", error);
        toast({
          title: "Error loading settings",
          description: "Failed to load your company settings. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [user, authLoading, form]);
  
  const onSubmit = async (data: InvoiceSettingsType) => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save company settings",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Saving settings:", data);
      await upsertInvoiceSettings(user.id, data);
      
      toast({
        title: "Success",
        description: "My Company information saved successfully",
      });
    } catch (error) {
      console.error("Error saving company settings:", error);
      toast({
        title: "Error",
        description: `Failed to save company settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    authLoading,
    isLoading,
    previewUrl,
    setPreviewUrl,
    form,
    onSubmit
  };
};
