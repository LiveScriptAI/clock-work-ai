
import React from "react";

interface InvoiceSummaryProps {
  subtotal: string;
  vat: string;
  total: string;
  isVatRegistered: boolean;
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  subtotal,
  vat,
  total,
  isVatRegistered,
}) => {
  return (
    <div className="flex flex-col items-end space-y-2 pt-4">
      <div className="grid grid-cols-2 gap-2 w-full max-w-md">
        <span className="text-gray-600 font-medium">Subtotal:</span>
        <span className="text-right">£{subtotal}</span>
        
        {isVatRegistered && (
          <>
            <span className="text-gray-600 font-medium">VAT (20%):</span>
            <span className="text-right">£{vat}</span>
          </>
        )}
        
        <span className="text-lg font-bold">Total:</span>
        <span className="text-lg font-bold text-right">£{total}</span>
      </div>
    </div>
  );
};

export default InvoiceSummary;
