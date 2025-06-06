
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import WelcomePage from "./pages/Welcome";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import EmailVerificationPage from "./pages/EmailVerification";
import DashboardPage from "./pages/Dashboard";
import BillingPage from "./pages/BillingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/email-verification" element={<EmailVerificationPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
