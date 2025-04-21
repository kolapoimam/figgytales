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
import Header from "@/components/Header";  // Import your Header component

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
              <Header /> {/* Add the Header here */}
              <AppRoutes />
            </BrowserRouter>
          </FileProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;