
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

type TimeTrackingProps = {
  startTime: Date | null;
  endTime: Date | null;
  isShiftActive: boolean;
  isShiftComplete: boolean;
  managerName: string;
  endManagerName: string;
  handleStartShift: () => void;
  handleEndShift: () => void;
};

const TimeTracking: React.FC<TimeTrackingProps> = ({
  startTime,
  endTime,
  isShiftActive,
  isShiftComplete,
  managerName,
  endManagerName,
  handleStartShift,
  handleEndShift,
}) => {
  const { t } = useTranslation();
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          {t('Time Tracking')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {startTime && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <span className="font-medium">{t('Clocked in at')}:</span> {format(startTime, "h:mm a 'on' MMMM d, yyyy")}
            </p>
            <p className="text-sm text-green-800 mt-1">
              <span className="font-medium">{t('Manager')}:</span> {managerName}
            </p>
            
            {isShiftComplete && endTime && (
              <div className="mt-2 pt-2 border-t border-green-200">
                <p className="text-sm text-red-600">
                  <span className="font-medium">{t('Clocked out at')}:</span> {format(endTime, "h:mm a")}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  <span className="font-medium">{t('Approved by')}:</span> {endManagerName}
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            size="lg" 
            className={`${isShiftActive ? 'bg-gray-400 hover:bg-gray-500' : 'bg-green-600 hover:bg-green-700'}`} 
            onClick={handleStartShift}
            disabled={isShiftActive || isShiftComplete}
          >
            {isShiftActive ? t('Shift Started') : t('Start Shift')}
          </Button>
          
          <Button 
            size="lg" 
            className="bg-red-600 hover:bg-red-700" 
            onClick={handleEndShift}
            disabled={!isShiftActive || isShiftComplete}
          >
            {t('End Shift')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTracking;
