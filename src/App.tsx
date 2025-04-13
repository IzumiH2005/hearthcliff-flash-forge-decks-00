
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { generateSampleData } from "./lib/localStorage";

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

const queryClient = new QueryClient();

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
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/create" element={<CreatePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/deck/:id" element={<DeckPage />} />
                <Route path="/deck/:deckId/theme/:themeId" element={<ThemePage />} />
                <Route path="/deck/:id/study" element={<StudyPage />} />
                <Route path="/import/:code" element={<ImportPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
