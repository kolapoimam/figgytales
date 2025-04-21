import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { FileProvider, useFiles } from "./context/FileContext";
import { ThemeProvider } from "./context/ThemeContext";
import Index from "./pages/Index";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";
import ShareView from "./pages/ShareView";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import HistoryView from "./pages/HistoryView";
import Pricing from "./pages/Pricing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Roadmap from "./pages/Roadmap";
import TermsOfService from "./pages/TermsOfService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Create a client
const queryClient = new QueryClient();

const AppRoutes = () => {
  const { stories } = useFiles();
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/results" element={<Results />} />
      <Route path="/share/:id" element={<ShareView />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/history/:id" element={<HistoryView />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <FileProvider>
            <Toaster />
            <Sonner 
              position="top-center"
              closeButton
              theme="light"
              richColors
            />
            <BrowserRouter>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <AppRoutes />
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </FileProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
