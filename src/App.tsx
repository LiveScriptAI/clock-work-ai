
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CustomerProvider } from "@/contexts/CustomerContext";
import DashboardPage from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CustomerProvider>
        <Toaster />
        <Sonner />
        <DashboardPage />
      </CustomerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
