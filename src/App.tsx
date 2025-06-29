
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Import Capacitor plugins for mobile app lifecycle
let App: any, AppState: any;
try {
  const capacitor = require('@capacitor/app');
  App = capacitor.App;
} catch (e) {
  // Capacitor not available (web environment)
}

const queryClient = new QueryClient();

const AppContent = () => {
  const [isAppActive, setIsAppActive] = useState(true);

  useEffect(() => {
    // Listen for app state changes on mobile
    if (App) {
      const listener = App.addListener('appStateChange', ({ isActive }: { isActive: boolean }) => {
        setIsAppActive(isActive);
        
        // When app comes back to foreground, refresh data
        if (isActive) {
          // Trigger custom events to refresh all data
          window.dispatchEvent(new CustomEvent('customerDataUpdated'));
          window.dispatchEvent(new CustomEvent('shiftDataUpdated'));
        }
      });

      return () => {
        listener?.remove();
      };
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </DataProvider>
    </QueryClientProvider>
  );
}

export default AppWrapper;
