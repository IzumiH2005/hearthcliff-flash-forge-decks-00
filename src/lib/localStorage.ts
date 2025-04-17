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
  isPublished?: boolean;
  publishedAt?: string;
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

// User functions
export const getUser = (): User | null => {
  return getItem<User | null>(STORAGE_KEYS.USER, null);
};

export const setUser = (user: User): void => {
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

export const createDeck = (deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Deck => {
  const decks = getDecks();
  const now = new Date().toISOString();
  
  const newDeck: Deck = {
    ...deck,
    id: `deck_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  
  setItem(STORAGE_KEYS.DECKS, [...decks, newDeck]);
  return newDeck;
};

export const updateDeck = (id: string, deckData: Partial<Deck>): Deck | null => {
  const decks = getDecks();
  const deckIndex = decks.findIndex(deck => deck.id === id);
  
  if (deckIndex === -1) return null;
  
  const updatedDeck = { 
    ...decks[deckIndex], 
    ...deckData, 
    updatedAt: new Date().toISOString() 
  };
  
  decks[deckIndex] = updatedDeck;
  setItem(STORAGE_KEYS.DECKS, decks);
  
  return updatedDeck;
};

export const deleteDeck = (id: string): boolean => {
  const decks = getDecks();
  const updatedDecks = decks.filter(deck => deck.id !== id);
  
  if (updatedDecks.length === decks.length) return false;
  
  setItem(STORAGE_KEYS.DECKS, updatedDecks);
  
  // Delete related themes and flashcards
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

// Add a new function to publish a deck to Supabase
export const publishDeck = async (deck: Deck): Promise<boolean> => {
  try {
    // Fetch the current user's profile
    const user = getUser();
    if (!user) {
      console.error('No user found');
      return false;
    }

    // Prepare deck data for Supabase
    const supabaseDeckData = {
      title: deck.title,
      description: deck.description,
      cover_image: deck.coverImage,
      author_id: user.id,
      author_name: user.name || 'Anonyme',
      is_published: true,
      tags: deck.tags,
    };

    // Insert the deck into Supabase
    const { data, error } = await supabase
      .from('decks')
      .insert(supabaseDeckData)
      .select()
      .single();

    if (error) {
      console.error('Error publishing deck:', error);
      return false;
    }

    // Update local storage to mark the deck as published
    const decks = getDecks();
    const updatedDecks = decks.map(localDeck => 
      localDeck.id === deck.id 
        ? { ...localDeck, isPublished: true, publishedAt: new Date().toISOString() } 
        : localDeck
    );
    setItem(STORAGE_KEYS.DECKS, updatedDecks);

    return true;
  } catch (error) {
    console.error('Unexpected error publishing deck:', error);
    return false;
  }
};

// Add a function to unpublish a deck
export const unpublishDeck = async (deckId: string): Promise<boolean> => {
  try {
    // Update the deck in Supabase to set is_published to false
    const { error } = await supabase
      .from('decks')
      .update({ is_published: false })
      .eq('id', deckId);

    if (error) {
      console.error('Error unpublishing deck:', error);
      return false;
    }

    // Update local storage to reflect unpublication
    const decks = getDecks();
    const updatedDecks = decks.map(localDeck => 
      localDeck.id === deckId 
        ? { ...localDeck, isPublished: false, publishedAt: undefined } 
        : localDeck
    );
    setItem(STORAGE_KEYS.DECKS, updatedDecks);

    return true;
  } catch (error) {
    console.error('Unexpected error unpublishing deck:', error);
    return false;
  }
};

// Add a function to update a published deck
export const updatePublishedDeck = async (deck: Deck): Promise<boolean> => {
  try {
    // Prepare updated deck data for Supabase
    const supabaseDeckData = {
      title: deck.title,
      description: deck.description,
      cover_image: deck.coverImage,
      tags: deck.tags,
      updated_at: new Date().toISOString(),
    };

    // Update the deck in Supabase
    const { error } = await supabase
      .from('decks')
      .update(supabaseDeckData)
      .eq('id', deck.id);

    if (error) {
      console.error('Error updating published deck:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating published deck:', error);
    return false;
  }
};
