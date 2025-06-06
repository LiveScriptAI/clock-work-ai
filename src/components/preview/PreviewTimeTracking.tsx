
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { usePreviewTimeTracking } from '@/hooks/usePreviewTimeTracking';

export const PreviewTimeTracking = () => {
  const {
    isShiftActive,
    isBreakActive,
    startTime,
    breakIntervals,
    workedDuration,
    handleStartShift,
    handleEndShift,
    handleBreakToggle,
    resetPreview,
    formatDuration
  } = usePreviewTimeTracking();

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Clock className="h-6 w-6" />
          Time Tracking Preview
        </CardTitle>
        <p className="text-gray-600">Try out our time tracking features - no signup required!</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Live Timer Display */}
        {startTime && (
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="text-4xl font-bold text-gray-800 mb-2">
              {formatDuration(workedDuration)}
            </div>
            <p className="text-gray-600">
              {isShiftActive ? 'Time worked today' : 'Final work time'}
            </p>
            {startTime && (
              <p className="text-sm text-gray-500 mt-2">
                Started at {format(startTime, 'h:mm a')}
              </p>
            )}
          </div>
        )}

        {/* Control Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            size="lg"
            onClick={handleStartShift}
            disabled={isShiftActive}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3"
          >
            {isShiftActive ? 'Shift Started' : 'Start Shift'}
          </Button>
          
          <Button
            size="lg"
            onClick={handleBreakToggle}
            disabled={!isShiftActive}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3"
          >
            {isBreakActive ? 'End Break' : 'Start Break'}
          </Button>
          
          <Button
            size="lg"
            onClick={handleEndShift}
            disabled={!isShiftActive}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3"
          >
            End Shift
          </Button>
          
          <Button
            size="lg"
            onClick={resetPreview}
            variant="outline"
            className="border-2 border-gray-300 hover:bg-gray-50 font-semibold py-3"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Break Intervals Display */}
        {breakIntervals.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Break History</h3>
            <div className="space-y-2">
              {breakIntervals.map((interval, index) => (
                <div key={index} className="text-sm text-blue-700 flex justify-between">
                  <span>Break {index + 1}</span>
                  <span>
                    {format(interval.start, 'HH:mm')} - {interval.end ? format(interval.end, 'HH:mm') : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Indicators */}
        <div className="flex justify-center gap-4 text-sm">
          <div className={`flex items-center gap-2 ${isShiftActive ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full ${isShiftActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            Shift {isShiftActive ? 'Active' : 'Inactive'}
          </div>
          <div className={`flex items-center gap-2 ${isBreakActive ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full ${isBreakActive ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            Break {isBreakActive ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* Preview Mode Notice */}
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium">
            🔍 Preview Mode - Data is not saved
          </p>
          <p className="text-yellow-700 text-sm mt-1">
            Sign up for a free trial to save your time tracking data and access advanced features
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
