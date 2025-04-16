// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface Theme {
  id: string;
  deckId: string;
  title: string;
  description: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  themeId?: string;
  front: {
    text: string;
    image?: string;
    audio?: string;
    additionalInfo?: string;
  };
  back: {
    text: string;
    image?: string;
    audio?: string;
    additionalInfo?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  authorId: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// LocalStorage Key Constants
const STORAGE_KEYS = {
  USER: 'cds-flashcard-user',
  DECKS: 'cds-flashcard-decks',
  THEMES: 'cds-flashcard-themes',
  FLASHCARDS: 'cds-flashcard-cards',
  SHARED: 'cds-flashcard-shared',
};

// Helper functions
const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item from localStorage: ${key}`, error);
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item in localStorage: ${key}`, error);
  }
};

// Import Supabase client
import { supabase } from "@/integrations/supabase/client";
// Import session manager to use session key as user ID
import { getSessionKey } from '@/lib/sessionManager';

// User functions
export const getUser = (): User | null => {
  const user = getItem<User | null>(STORAGE_KEYS.USER, null);
  
  // Si l'utilisateur existe et que nous avons une clé de session, assurez-vous que l'ID est la clé de session
  if (user) {
    const sessionKey = getSessionKey();
    if (sessionKey) {
      // Utiliser la clé de session comme ID utilisateur si elle est différente
      if (user.id !== sessionKey) {
        user.id = sessionKey;
        setUser(user);
      }
    }
  }
  
  return user;
};

export const setUser = (user: User): void => {
  // S'assurer que l'ID utilisateur est la clé de session, si disponible
  const sessionKey = getSessionKey();
  if (sessionKey) {
    user.id = sessionKey;
  }
  
  setItem(STORAGE_KEYS.USER, user);
};

export const updateUser = (userData: Partial<User>): User | null => {
  const currentUser = getUser();
  if (!currentUser) return null;
  
  const updatedUser = { ...currentUser, ...userData, updatedAt: new Date().toISOString() };
  setUser(updatedUser);
  return updatedUser;
};

// Deck functions
export const getDecks = (): Deck[] => {
  return getItem<Deck[]>(STORAGE_KEYS.DECKS, []);
};

export const getDeck = (id: string): Deck | null => {
  const decks = getDecks();
  return decks.find(deck => deck.id === id) || null;
};

// Fonction pour récupérer un deck depuis Supabase
export const fetchDeckFromSupabase = async (id: string): Promise<Deck | null> => {
  try {
    const { data: deckData, error } = await supabase
      .from('decks')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !deckData) {
      console.error("Error fetching deck from Supabase:", error);
      return null;
    }

    // Convertir le format Supabase en format Deck local
    const deck: Deck = {
      id: deckData.id,
      title: deckData.title,
      description: deckData.description || "",
      coverImage: deckData.cover_image,
      authorId: deckData.author_id,
      isPublic: deckData.is_public,
      tags: deckData.tags || [],
      createdAt: deckData.created_at,
      updatedAt: deckData.updated_at,
    };

    return deck;
  } catch (error) {
    console.error("Unexpected error fetching deck from Supabase:", error);
    return null;
  }
};

export const createDeck = async (deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deck> => {
  const decks = getDecks();
  const now = new Date().toISOString();
  
  // Utiliser la clé de session comme ID utilisateur si disponible
  const sessionKey = getSessionKey();
  const authorId = sessionKey || deck.authorId;
  
  const newDeck: Deck = {
    ...deck,
    authorId,
    id: `deck_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  
  // Sauvegarder localement
  setItem(STORAGE_KEYS.DECKS, [...decks, newDeck]);
  
  // Si public, sauvegarder également dans Supabase
  if (deck.isPublic) {
    await saveToSupabase(newDeck);
  }
  
  return newDeck;
};

// Fonction pour sauvegarder un deck dans Supabase
export const saveToSupabase = async (deck: Deck): Promise<boolean> => {
  try {
    // S'assurer que l'authorId est la clé de session, si disponible
    const sessionKey = getSessionKey();
    const authorId = sessionKey || deck.authorId;
    
    // Convertir le format local en format Supabase
    const supabaseDeck = {
      id: deck.id,
      title: deck.title,
      description: deck.description,
      cover_image: deck.coverImage,
      author_id: authorId,
      is_public: deck.isPublic,
      tags: deck.tags,
      created_at: deck.createdAt,
      updated_at: deck.updatedAt
    };

    console.log("Saving deck to Supabase with author_id:", authorId);

    const { error } = await supabase
      .from('decks')
      .upsert(supabaseDeck, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error("Error saving deck to Supabase:", error);
      return false;
    }

    console.log("Deck successfully saved to Supabase:", deck.id);
    return true;
  } catch (error) {
    console.error("Unexpected error saving deck to Supabase:", error);
    return false;
  }
};

export const updateDeck = async (id: string, deckData: Partial<Deck>): Promise<Deck | null> => {
  const decks = getDecks();
  const deckIndex = decks.findIndex(deck => deck.id === id);
  
  if (deckIndex === -1) return null;
  
  const currentDeck = decks[deckIndex];
  const wasPublic = currentDeck.isPublic;
  
  const updatedDeck = { 
    ...currentDeck, 
    ...deckData, 
    updatedAt: new Date().toISOString() 
  };
  
  decks[deckIndex] = updatedDeck;
  setItem(STORAGE_KEYS.DECKS, decks);
  
  // Si le deck devient public ou était déjà public et a été mis à jour
  if (updatedDeck.isPublic) {
    const saved = await saveToSupabase(updatedDeck);
    if (!saved) {
      console.error("Failed to save public deck to Supabase");
    } else if (!wasPublic) {
      console.log("Deck changed from private to public and saved to Supabase");
    }
  }
  // Si le deck était public mais ne l'est plus, le supprimer de Supabase
  else if (wasPublic && !updatedDeck.isPublic) {
    try {
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error removing deck from Supabase:", error);
      } else {
        console.log("Deck successfully removed from Supabase (now private)");
      }
    } catch (error) {
      console.error("Unexpected error removing deck from Supabase:", error);
    }
  }
  
  return updatedDeck;
};

export const deleteDeck = async (id: string): Promise<boolean> => {
  const decks = getDecks();
  const deckToDelete = decks.find(deck => deck.id === id);
  const updatedDecks = decks.filter(deck => deck.id !== id);
  
  if (updatedDecks.length === decks.length) return false;
  
  setItem(STORAGE_KEYS.DECKS, updatedDecks);
  
  // Si le deck était public, le supprimer également de Supabase
  if (deckToDelete && deckToDelete.isPublic) {
    try {
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting deck from Supabase:", error);
      }
    } catch (error) {
      console.error("Unexpected error deleting deck from Supabase:", error);
    }
  }
  
  // Supprimer les thèmes et flashcards associés
  const themes = getThemes();
  const updatedThemes = themes.filter(theme => theme.deckId !== id);
  setItem(STORAGE_KEYS.THEMES, updatedThemes);
  
  const flashcards = getFlashcards();
  const updatedFlashcards = flashcards.filter(card => card.deckId !== id);
  setItem(STORAGE_KEYS.FLASHCARDS, updatedFlashcards);
  
  return true;
};

// Theme functions
export const getThemes = (): Theme[] => {
  return getItem<Theme[]>(STORAGE_KEYS.THEMES, []);
};

export const getThemesByDeck = (deckId: string): Theme[] => {
  const themes = getThemes();
  return themes.filter(theme => theme.deckId === deckId);
};

export const getTheme = (id: string): Theme | undefined => {
  const themes = getThemes();
  return themes.find(theme => theme.id === id);
};

export const createTheme = (theme: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>): Theme => {
  const themes = getThemes();
  const now = new Date().toISOString();
  
  const newTheme: Theme = {
    ...theme,
    id: `theme_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  
  setItem(STORAGE_KEYS.THEMES, [...themes, newTheme]);
  return newTheme;
};

export const updateTheme = (id: string, themeData: Partial<Theme>): Theme | null => {
  const themes = getThemes();
  const themeIndex = themes.findIndex(theme => theme.id === id);
  
  if (themeIndex === -1) return null;
  
  const updatedTheme = { 
    ...themes[themeIndex], 
    ...themeData, 
    updatedAt: new Date().toISOString() 
  };
  
  themes[themeIndex] = updatedTheme;
  setItem(STORAGE_KEYS.THEMES, themes);
  
  return updatedTheme;
};

export const deleteTheme = (id: string): boolean => {
  const themes = getThemes();
  const updatedThemes = themes.filter(theme => theme.id !== id);
  
  if (updatedThemes.length === themes.length) return false;
  
  setItem(STORAGE_KEYS.THEMES, updatedThemes);
  
  // Update related flashcards to remove theme reference
  const flashcards = getFlashcards();
  const updatedFlashcards = flashcards.map(card => {
    if (card.themeId === id) {
      return { ...card, themeId: undefined };
    }
    return card;
  });
  
  setItem(STORAGE_KEYS.FLASHCARDS, updatedFlashcards);
  
  return true;
};

// Flashcard functions
export const getFlashcards = (): Flashcard[] => {
  return getItem<Flashcard[]>(STORAGE_KEYS.FLASHCARDS, []);
};

export const getFlashcardsByDeck = (deckId: string): Flashcard[] => {
  const flashcards = getFlashcards();
  return flashcards.filter(card => card.deckId === deckId);
};

export const getFlashcardsByTheme = (themeId: string): Flashcard[] => {
  const flashcards = getFlashcards();
  return flashcards.filter(card => card.themeId === themeId);
};

export const getFlashcard = (id: string): Flashcard | undefined => {
  const flashcards = getFlashcards();
  return flashcards.find(card => card.id === id);
};

export const createFlashcard = (flashcard: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>): Flashcard => {
  const flashcards = getFlashcards();
  const now = new Date().toISOString();
  
  const newFlashcard: Flashcard = {
    ...flashcard,
    id: `card_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  
  setItem(STORAGE_KEYS.FLASHCARDS, [...flashcards, newFlashcard]);
  return newFlashcard;
};

export const updateFlashcard = (id: string, cardData: Partial<Flashcard>): Flashcard | null => {
  const flashcards = getFlashcards();
  const cardIndex = flashcards.findIndex(card => card.id === id);
  
  if (cardIndex === -1) return null;
  
  const updatedCard = { 
    ...flashcards[cardIndex], 
    ...cardData, 
    updatedAt: new Date().toISOString() 
  };
  
  flashcards[cardIndex] = updatedCard;
  setItem(STORAGE_KEYS.FLASHCARDS, flashcards);
  
  return updatedCard;
};

export const deleteFlashcard = (id: string): boolean => {
  const flashcards = getFlashcards();
  const updatedFlashcards = flashcards.filter(card => card.id !== id);
  
  if (updatedFlashcards.length === flashcards.length) return false;
  
  setItem(STORAGE_KEYS.FLASHCARDS, updatedFlashcards);
  return true;
};

// Shared deck functions
interface SharedDeckCode {
  code: string;
  deckId: string;
  expiresAt?: string;
}

export const getSharedDeckCodes = (): SharedDeckCode[] => {
  return getItem<SharedDeckCode[]>(STORAGE_KEYS.SHARED, []);
};

export const createShareCode = (deckId: string, expiresInDays?: number): string => {
  const sharedCodes = getSharedDeckCodes();
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  const newSharedCode: SharedDeckCode = {
    code,
    deckId,
    expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 86400000).toISOString() : undefined,
  };
  
  setItem(STORAGE_KEYS.SHARED, [...sharedCodes, newSharedCode]);
  return code;
};

export const getSharedDeck = (code: string): Deck | undefined => {
  const sharedCodes = getSharedDeckCodes();
  const sharedCode = sharedCodes.find(sc => sc.code === code);
  
  if (!sharedCode) return undefined;
  
  // Check if expired
  if (sharedCode.expiresAt && new Date(sharedCode.expiresAt) < new Date()) {
    // Remove expired code
    const updatedCodes = sharedCodes.filter(sc => sc.code !== code);
    setItem(STORAGE_KEYS.SHARED, updatedCodes);
    return undefined;
  }
  
  return getDeck(sharedCode.deckId);
};

// Image/Audio Utils
export const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Initialize default user if none exists
export const initializeDefaultUser = (): User => {
  const defaultUser: User = {
    id: `user_${Date.now()}`,
    name: "Utilisateur",
    email: "utilisateur@example.com",
    avatar: undefined,
    bio: "Bienvenue sur CDS Flashcard-Base ! Modifiez votre profil pour personnaliser votre expérience.",
    createdAt: new Date().toISOString(),
  };
  
  const currentUser = getUser();
  if (!currentUser) {
    setUser(defaultUser);
    return defaultUser;
  }
  
  return currentUser;
};

// Synchroniser tous les decks publics vers Supabase
export const syncPublicDecksToSupabase = async (): Promise<number> => {
  const decks = getDecks();
  const publicDecks = decks.filter(deck => deck.isPublic);
  
  if (publicDecks.length === 0) {
    console.log("No public decks to sync to Supabase");
    return 0;
  }
  
  console.log(`Syncing ${publicDecks.length} public decks to Supabase`);
  
  let successCount = 0;
  
  for (const deck of publicDecks) {
    const success = await saveToSupabase(deck);
    if (success) {
      successCount++;
    }
  }
  
  console.log(`Successfully synced ${successCount}/${publicDecks.length} decks to Supabase`);
  return successCount;
};

// Sample data generator for demo
export const generateSampleData = (): void => {
  // Only initialize empty collections if they don't exist yet
  if (!localStorage.getItem('decks')) {
    localStorage.setItem('decks', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('themes')) {
    localStorage.setItem('themes', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('flashcards')) {
    localStorage.setItem('flashcards', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
  }
};
