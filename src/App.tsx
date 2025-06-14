
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// Removed AuthProvider import
// Removed ProtectedRoute import
import NotFound from "./pages/NotFound";
import WelcomePage from "./pages/Welcome";
// Removed LoginPage import
// Removed RegisterPage import
// Removed DashboardPage import
// Removed ThankYou import

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Removed AuthProvider wrapper */}
        <Routes>
          <Route path="/welcome" element={<WelcomePage />} />
          {/* Removed /login route */}
          {/* Removed /register route */}
          {/* Removed /thank-you route */}
          {/* Removed /dashboard route */}
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
