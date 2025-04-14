
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { generateSampleData } from "./lib/localStorage";
import { hasSession } from "./lib/sessionManager";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Pages
import HomePage from "@/pages/HomePage";
import ExplorePage from "@/pages/ExplorePage";
import CreatePage from "@/pages/CreatePage";
import ProfilePage from "@/pages/ProfilePage";
import DeckPage from "@/pages/DeckPage";
import ThemePage from "@/pages/ThemePage";
import StudyPage from "@/pages/StudyPage";
import NotFound from "@/pages/NotFound";
import ImportPage from "@/pages/ImportPage";
import LoginPage from "@/pages/LoginPage";
import Index from "@/pages/Index";

const queryClient = new QueryClient();

// Protected route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!hasSession()) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  useEffect(() => {
    // Initialize sample data on first load
    generateSampleData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Index />} />
              
              {/* Protected routes with Navbar and Footer */}
              <Route path="/" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/home" element={
                        <ProtectedRoute>
                          <HomePage />
                        </ProtectedRoute>
                      } />
                      <Route path="/explore" element={
                        <ProtectedRoute>
                          <ExplorePage />
                        </ProtectedRoute>
                      } />
                      <Route path="/create" element={
                        <ProtectedRoute>
                          <CreatePage />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } />
                      <Route path="/deck/:id" element={
                        <ProtectedRoute>
                          <DeckPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/deck/:deckId/theme/:themeId" element={
                        <ProtectedRoute>
                          <ThemePage />
                        </ProtectedRoute>
                      } />
                      <Route path="/deck/:id/study" element={
                        <ProtectedRoute>
                          <StudyPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/import/:code" element={
                        <ProtectedRoute>
                          <ImportPage />
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </main>
                  <Footer />
                </>
              }/>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
