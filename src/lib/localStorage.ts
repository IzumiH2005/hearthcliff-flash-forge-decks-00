
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
  };
  back: {
    text: string;
    image?: string;
    audio?: string;
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

export const getDeck = (id: string): Deck | undefined => {
  const decks = getDecks();
  return decks.find(deck => deck.id === id);
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
export const generateSampleData = () => {
  const user = initializeDefaultUser();
  
  // Check if we already have sample data
  if (getDecks().length > 0) return;
  
  // Sample decks
  const sampleDecks: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      title: "Vocabulaire Anglais Basique",
      description: "Un ensemble de cartes pour apprendre le vocabulaire anglais de base",
      authorId: user.id,
      isPublic: true,
      tags: ["anglais", "vocabulaire", "débutant"],
      coverImage: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500&auto=format"
    },
    {
      title: "Capitales du Monde",
      description: "Apprenez les capitales des pays du monde entier",
      authorId: user.id,
      isPublic: true,
      tags: ["géographie", "capitales", "monde"],
      coverImage: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=500&auto=format"
    },
    {
      title: "Formules Mathématiques",
      description: "Les formules mathématiques essentielles pour le lycée",
      authorId: user.id,
      isPublic: true,
      tags: ["mathématiques", "formules", "lycée"],
      coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format"
    }
  ];
  
  // Create sample decks
  const createdDecks = sampleDecks.map(deck => createDeck(deck));
  
  // Create themes for the English vocabulary deck
  const englishDeck = createdDecks[0];
  const englishThemes: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      deckId: englishDeck.id,
      title: "Aliments",
      description: "Vocabulaire lié à la nourriture et aux repas",
      coverImage: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=500&auto=format"
    },
    {
      deckId: englishDeck.id,
      title: "Transports",
      description: "Termes liés aux différents moyens de transport",
      coverImage: "https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=500&auto=format"
    },
    {
      deckId: englishDeck.id,
      title: "Maison",
      description: "Tout le vocabulaire pour décrire une maison et ses pièces",
      coverImage: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&auto=format"
    }
  ];
  
  // Create sample themes
  const createdThemes = englishThemes.map(theme => createTheme(theme));
  
  // Create flashcards for the food theme
  const foodTheme = createdThemes[0];
  const foodCards: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      deckId: englishDeck.id,
      themeId: foodTheme.id,
      front: { text: "Apple" },
      back: { text: "Pomme", image: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=500&auto=format" }
    },
    {
      deckId: englishDeck.id,
      themeId: foodTheme.id,
      front: { text: "Bread" },
      back: { text: "Pain", image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=500&auto=format" }
    },
    {
      deckId: englishDeck.id,
      themeId: foodTheme.id,
      front: { text: "Cheese" },
      back: { text: "Fromage", image: "https://images.unsplash.com/photo-1566454419290-57a64afe30ac?w=500&auto=format" }
    },
    {
      deckId: englishDeck.id,
      themeId: foodTheme.id,
      front: { text: "Drink" },
      back: { text: "Boisson" }
    },
    {
      deckId: englishDeck.id,
      themeId: foodTheme.id,
      front: { text: "Egg" },
      back: { text: "Œuf", image: "https://images.unsplash.com/photo-1607690424560-38fad6ae8fcc?w=500&auto=format" }
    }
  ];
  
  // Create flashcards for the other themes and decks
  const transportTheme = createdThemes[1];
  const transportCards: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      deckId: englishDeck.id,
      themeId: transportTheme.id,
      front: { text: "Car" },
      back: { text: "Voiture", image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format" }
    },
    {
      deckId: englishDeck.id,
      themeId: transportTheme.id,
      front: { text: "Bicycle" },
      back: { text: "Vélo", image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format" }
    },
    {
      deckId: englishDeck.id,
      themeId: transportTheme.id,
      front: { text: "Train" },
      back: { text: "Train", image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=500&auto=format" }
    }
  ];
  
  // Create some capitals flashcards for the second deck
  const capitalsCards: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      deckId: createdDecks[1].id,
      front: { text: "France" },
      back: { text: "Paris", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=500&auto=format" }
    },
    {
      deckId: createdDecks[1].id,
      front: { text: "Japon" },
      back: { text: "Tokyo", image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=500&auto=format" }
    },
    {
      deckId: createdDecks[1].id,
      front: { text: "Italie" },
      back: { text: "Rome", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500&auto=format" }
    },
    {
      deckId: createdDecks[1].id,
      front: { text: "Espagne" },
      back: { text: "Madrid", image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=500&auto=format" }
    },
    {
      deckId: createdDecks[1].id,
      front: { text: "Royaume-Uni" },
      back: { text: "Londres", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500&auto=format" }
    }
  ];
  
  // Create all flashcards
  [...foodCards, ...transportCards, ...capitalsCards].forEach(card => createFlashcard(card));
};
