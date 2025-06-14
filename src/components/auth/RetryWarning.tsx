
import React from "react";

interface RetryWarningProps {
  retryCount: number;
}

const RetryWarning = ({ retryCount }: RetryWarningProps) => {
  if (retryCount < 2) return null;

  return (
    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
      <p className="text-sm text-yellow-800">
        Multiple login attempts detected. Please wait a moment before trying again.
      </p>
    </div>
  );
};

export default RetryWarning;
