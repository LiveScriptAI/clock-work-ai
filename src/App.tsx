
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Register from "./pages/Register";
import Login from "./pages/Login";
import EmailVerification from "./pages/EmailVerification";
import EmailVerificationSuccess from "./pages/EmailVerificationSuccess";
import Dashboard from "./pages/Dashboard";
import BillingPage from "./pages/BillingPage";
import SubscriptionRequired from "./pages/SubscriptionRequired";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/email-verification" element={<EmailVerification />} />
            <Route path="/email-verification-success" element={<EmailVerificationSuccess />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/subscription-required" element={<SubscriptionRequired />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
