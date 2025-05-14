import React from "react";
import InvoiceSettingsForm from "@/components/invoice/InvoiceSettingsForm";
import { useAuth } from "@/hooks/useAuth";

const InvoicingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Invoicing</h1>
          
          {/* Invoice Settings Form */}
          <InvoiceSettingsForm />
          
          {/* Other invoicing content can be added here in the future */}
        </div>
      </main>
    </div>
  );
};

export default InvoicingPage;
