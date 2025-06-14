
import { useState, useEffect } from "react";
// Removed useAuth import
import { getBreakIntervalsFromSupabase, deleteBreakIntervalsFromSupabase, BreakInterval } from "@/services/breakDataService";
import { toast } from "sonner";

export const useBreakData = (userId?: string) => { // Accept userId as a parameter
  // Removed user from useAuth()
  const [breakIntervalsByShift, setBreakIntervalsByShift] = useState<Record<string, BreakInterval[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBreakData = async () => {
    if (!userId) { // Check passed userId
      setIsLoading(false);
      setError("User ID not provided to fetch break data.");
      console.warn("useBreakData: User ID not provided. Cannot fetch break data.");
      setBreakIntervalsByShift({});
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getBreakIntervalsFromSupabase(userId);
      setBreakIntervalsByShift(data);
    } catch (err) {
      console.error("useBreakData - Error fetching break data:", err);
      setError("Failed to load break data");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBreakForShift = async (shiftId: string): Promise<boolean> => {
    if (!userId) { // Check passed userId
      toast.error("User not authenticated to delete break");
      console.warn("useBreakData: User ID not provided. Cannot delete break data.");
      return false;
    }

    try {
      const success = await deleteBreakIntervalsFromSupabase(shiftId, userId);
      
      if (success) {
        setBreakIntervalsByShift(prev => {
          const updated = { ...prev };
          delete updated[shiftId];
          return updated;
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("useBreakData - Error deleting break:", error);
      return false;
    }
  };

  const refreshBreakData = () => {
    fetchBreakData();
  };

  useEffect(() => {
    if (userId) { // Only fetch if userId is provided
        fetchBreakData();
    } else {
        setIsLoading(false);
        setBreakIntervalsByShift({});
    }
  }, [userId]); // Depend on passed userId

  return {
    breakIntervalsByShift,
    isLoading,
    error,
    deleteBreakForShift,
    refreshBreakData
  };
};
