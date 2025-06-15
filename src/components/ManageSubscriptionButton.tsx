
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Settings } from "lucide-react";
import { toast } from "sonner";

interface ManageSubscriptionButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ManageSubscriptionButton({ 
  variant = "outline", 
  size = "default",
  className = ""
}: ManageSubscriptionButtonProps) {
  const { user, isSubscribed } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    if (!user) {
      toast.error("Please log in to manage your subscription");
      return;
    }

    if (!isSubscribed) {
      toast.error("You don't have an active subscription to manage");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("Opening customer portal for user:", user.email);
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (error) {
        console.error("Customer portal error:", error);
        toast.error("Failed to open subscription management. Please try again.");
        return;
      }
      
      if (data?.error) {
        console.error("Server error:", data.error);
        toast.error(data.error);
        return;
      }
      
      if (data?.url) {
        console.log("Redirecting to customer portal:", data.url);
        window.open(data.url, '_blank');
        
        toast.success("Subscription management opened in new tab", {
          duration: 3000
        });
      } else {
        console.error("No portal URL received:", data);
        toast.error("Failed to create portal session. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected portal error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleManageSubscription}
      disabled={isLoading || !isSubscribed}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : (
        <Settings className="w-4 h-4 mr-2" />
      )}
      {isLoading ? "Opening..." : "Manage Subscription"}
    </Button>
  );
}
