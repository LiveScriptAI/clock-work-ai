
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

import DateRangePicker from "./DateRangePicker";
import ExportActions from "./timesheet/ExportActions";
import TimeTabContent from "./timesheet/TimeTabContent";
import BreaksSummary from "./BreaksSummary";
import { ShiftEntry } from "./timesheet/types";
import { getBreakIntervalsByShift } from "@/services/breakIntervalsService";
import { transformShiftData } from "@/services/shiftService";

const TimesheetLog = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("week");
  const [customDateRange, setCustomDateRange] = useState<{ from: Date; to: Date } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch shifts from Supabase
  const { data: shifts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['shifts', user?.id, refreshKey],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching shifts:', error);
        throw error;
      }

      // Convert Supabase data to ShiftEntry format
      const shiftEntries: ShiftEntry[] = (data || []).map(transformShiftData);
      return shiftEntries;
    },
    enabled: !!user?.id,
  });

  // Handle break data refresh
  const handleBreakDeleted = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Delete shift function
  const handleDeleteShift = async (shiftId: string) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Refresh the shifts data
      refetch();
    } catch (error) {
      console.error('Error deleting shift:', error);
      throw error;
    }
  };

  // Filter shifts based on active tab and date range
  const getFilteredShifts = (shifts: ShiftEntry[], period: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (customDateRange) {
      startDate = customDateRange.from;
      endDate = customDateRange.to;
    } else {
      switch (period) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          break;
        case "week":
          startDate = startOfWeek(now, { weekStartsOn: 1 });
          endDate = endOfWeek(now, { weekStartsOn: 1 });
          break;
        case "month":
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case "last7":
          startDate = subDays(now, 6);
          endDate = now;
          break;
        case "last30":
          startDate = subDays(now, 29);
          endDate = now;
          break;
        default:
          return shifts;
      }
    }

    return shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= startDate && shiftDate <= endDate;
    });
  };

  const filteredShifts = getFilteredShifts(shifts, activeTab);
  const isDateRangeActive = !!customDateRange;

  // Handle date range change with proper typing
  const handleDateRangeChange = (range: { from?: Date; to?: Date } | null) => {
    if (range && range.from && range.to) {
      setCustomDateRange({ from: range.from, to: range.to });
    } else {
      setCustomDateRange(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Timesheet Log
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <DateRangePicker 
                onDateRangeChange={handleDateRangeChange}
                dateRange={customDateRange}
              />
              <ExportActions />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
              <TabsTrigger value="last7">Last 7 Days</TabsTrigger>
              <TabsTrigger value="last30">Last 30 Days</TabsTrigger>
            </TabsList>
            
            {["today", "week", "month", "last7", "last30"].map((period) => (
              <TimeTabContent
                key={period}
                period={period}
                activeTab={activeTab}
                filteredShifts={getFilteredShifts(shifts, period)}
                isLoading={isLoading}
                isDateRangeActive={isDateRangeActive}
                error={error?.message || null}
                onDeleteShift={handleDeleteShift}
              />
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <BreaksSummary onBreakDeleted={handleBreakDeleted} />
    </div>
  );
};

export default TimesheetLog;
