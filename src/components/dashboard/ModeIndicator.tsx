import React from 'react';
import { Badge } from '@/components/ui/badge';

const ModeIndicator: React.FC = () => {
  // For now, we'll show "Live Mode" - this could be made dynamic later
  const isTestMode = false; // This could come from app state/settings
  
  return (
    <div className="flex justify-center mb-4">
      <Badge 
        variant={isTestMode ? "secondary" : "default"}
        className={`
          px-3 py-1 text-xs font-medium rounded-full
          ${isTestMode 
            ? "bg-yellow-100 text-yellow-700 border-yellow-200" 
            : "bg-green-100 text-green-700 border-green-200"
          }
        `}
      >
        {isTestMode ? "Test Mode" : "Live Mode"}
      </Badge>
    </div>
  );
};

export default ModeIndicator;