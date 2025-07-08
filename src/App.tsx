import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DomainGuard from "./components/DomainGuard";
import PageTransition from "./components/transitions/PageTransition";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SupportPage from "./pages/SupportPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DomainGuard>
            <PageTransition>
              <Routes>
                {/* Public marketing site routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/support" element={<SupportPage />} />
                
                {/* App routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/app" element={<Dashboard />} /> {/* Legacy redirect */}
                
                {/* 404 page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </DomainGuard>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
