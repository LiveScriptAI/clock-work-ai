
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getBreakIntervalsFromSupabase, deleteBreakIntervalsFromSupabase, BreakInterval } from "@/services/breakDataService";
import { toast } from "sonner";

export const useBreakData = () => {
  const { user } = useAuth();
  const [breakIntervalsByShift, setBreakIntervalsByShift] = useState<Record<string, BreakInterval[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBreakData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getBreakIntervalsFromSupabase(user.id);
      setBreakIntervalsByShift(data);
    } catch (err) {
      console.error("useBreakData - Error fetching break data:", err);
      setError("Failed to load break data");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBreakForShift = async (shiftId: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return false;
    }

    try {
      const success = await deleteBreakIntervalsFromSupabase(shiftId, user.id);
      
      if (success) {
        // Remove from local state
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
    fetchBreakData();
  }, [user?.id]);

  return {
    breakIntervalsByShift,
    isLoading,
    error,
    deleteBreakForShift,
    refreshBreakData
  };
};
