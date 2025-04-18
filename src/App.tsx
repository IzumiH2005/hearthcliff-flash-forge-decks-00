import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { initializeDefaultUser, generateSampleData } from "@/lib/localStorage"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Layout Components
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

// Pages
import Index from "@/pages/Index"
import DeckPage from "@/pages/DeckPage"
import ThemePage from "@/pages/ThemePage"
import CreatePage from "@/pages/CreatePage"
import NotFound from "@/pages/NotFound"
import HomePage from "@/pages/HomePage"
import MyDecksPage from "@/pages/MyDecksPage"
import StudyPage from "@/pages/StudyPage"
import ProfilePage from "@/pages/ProfilePage"
import LoginPage from "@/pages/LoginPage"
import EditDeckPage from "@/pages/EditDeckPage"
import LearningMethodsPage from "@/pages/LearningMethodsPage"
import StatsPage from "@/pages/StatsPage"
import ImportPage from "@/pages/ImportPage"
import ExplorePage from "@/pages/ExplorePage"
import SharePage from "@/pages/SharePage"

import "./App.css"

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    },
  },
})

function App() {
  useEffect(() => {
    // Initialize session and session manager - removed invalid import
    
    // Create default user if none exists
    initializeDefaultUser()
    
    // Generate sample data if needed
    generateSampleData()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="flashcard-theme">
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/decks" element={<MyDecksPage />} />
                <Route path="/deck/:id" element={<DeckPage />} />
                <Route path="/deck/:id/edit" element={<EditDeckPage />} />
                <Route path="/deck/:deckId/theme/:themeId" element={<ThemePage />} />
                <Route path="/deck/:id/study" element={<StudyPage />} />
                <Route path="/create" element={<CreatePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/methods" element={<LearningMethodsPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/import" element={<ImportPage />} />
                <Route path="/import/:code" element={<ImportPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/share" element={<SharePage />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
            
            <Footer />
          </div>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
