
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import LogoUpload from "./LogoUpload";
import CompanyAddressForm from "./CompanyAddressForm";
import { useCompanySettings } from "./useCompanySettings";

const MyCompanyForm = () => {
  const {
    user,
    authLoading,
    isLoading,
    previewUrl,
    setPreviewUrl,
    form,
    onSubmit
  } = useCompanySettings();

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            You must be logged in to access company settings.
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleLogoUploaded = (url: string) => {
    form.setValue('logo_url', url);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <LogoUpload
                previewUrl={previewUrl}
                setPreviewUrl={setPreviewUrl}
                onLogoUploaded={handleLogoUploaded}
              />
              
              <CompanyAddressForm form={form} />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? "Saving..." : "Save My Company Details"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MyCompanyForm;
