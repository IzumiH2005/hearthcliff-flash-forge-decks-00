
// Session key management utilities

// Storage key constant
const STORAGE_KEY = "cds-flashcard-session-key";
const USER_DATA_PREFIX = "cds-flashcard-user-";
const SESSION_EXPIRY_KEY = "cds-flashcard-session-expiry";
const SESSION_DURATION_DAYS = 30; // Sessions valid for 30 days by default
const STATS_KEY_SUFFIX = "_stats";
const LAST_ACTIVITY_KEY_SUFFIX = "_last_activity";

// Generate a new session key
export const generateSessionKey = (): string => {
  return Math.random().toString(36).substring(2, 6).toUpperCase() + 
         Math.random().toString(36).substring(2, 6).toUpperCase() + 
         Math.random().toString(36).substring(2, 4).toUpperCase();
};

// Save session key to localStorage with expiration
export const saveSessionKey = (key: string): void => {
  localStorage.setItem(STORAGE_KEY, key);
  
  // Set session expiry
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + SESSION_DURATION_DAYS);
  localStorage.setItem(SESSION_EXPIRY_KEY, expiryDate.toISOString());
  
  // Initialize user data for this session if not already present
  initializeUserDataForSession(key);
  
  // Record last activity
  updateLastActivity();
};

// Get session key from localStorage
export const getSessionKey = (): string | null => {
  return localStorage.getItem(STORAGE_KEY);
};

// Remove session key (logout)
export const clearSessionKey = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SESSION_EXPIRY_KEY);
};

// Check if a session exists
export const hasSession = (): boolean => {
  return !!getSessionKey() && !isSessionExpired();
};

// Check if the session is expired
export const isSessionExpired = (): boolean => {
  const expiryDateString = localStorage.getItem(SESSION_EXPIRY_KEY);
  if (!expiryDateString) return false; // No expiry set, assume not expired
  
  const expiryDate = new Date(expiryDateString);
  const currentDate = new Date();
  
  return currentDate > expiryDate;
};

// Extend session validity
export const extendSession = (): void => {
  const sessionKey = getSessionKey();
  if (!sessionKey) return;
  
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + SESSION_DURATION_DAYS);
  localStorage.setItem(SESSION_EXPIRY_KEY, expiryDate.toISOString());
  
  // Update last activity timestamp
  updateLastActivity();
};

// Track last user activity
export const updateLastActivity = (): void => {
  const sessionKey = getSessionKey();
  if (!sessionKey) return;
  
  localStorage.setItem(
    `${USER_DATA_PREFIX}${sessionKey}${LAST_ACTIVITY_KEY_SUFFIX}`, 
    new Date().toISOString()
  );
  
  // Update stats with this activity
  updateSessionStats({ lastActive: new Date().toISOString() });
};

// Verify if session is valid (in a real app this would check against a backend)
export const verifySession = (): boolean => {
  const sessionKey = getSessionKey();
  if (!sessionKey) return false;
  if (isSessionExpired()) {
    clearSessionKey();
    return false;
  }
  
  // In a real app, this would validate the session key with a backend
  // For this demo, we'll just check if it follows our expected format
  const isValidFormat = /^[A-Z0-9]{12,14}$/.test(sessionKey);
  const hasUserData = getUserDataKeys(sessionKey).length > 0;
  
  // Extend session validity if it's valid
  if (isValidFormat) {
    extendSession();
    updateLastActivity();
  }
  
  return isValidFormat;
};

// Initialize user data for a new session
const initializeUserDataForSession = (sessionKey: string): void => {
  // Check if this is a new session without data
  const userDataKeys = getUserDataKeys(sessionKey);
  if (userDataKeys.length === 0) {
    // Initialize with empty data structures
    localStorage.setItem(`${USER_DATA_PREFIX}${sessionKey}_decks`, JSON.stringify([]));
    localStorage.setItem(`${USER_DATA_PREFIX}${sessionKey}_themes`, JSON.stringify([]));
    localStorage.setItem(`${USER_DATA_PREFIX}${sessionKey}_flashcards`, JSON.stringify([]));
    localStorage.setItem(`${USER_DATA_PREFIX}${sessionKey}_profile`, JSON.stringify({
      name: "Utilisateur",
      createdAt: new Date().toISOString()
    }));
    
    // Initialize session statistics
    initializeSessionStats(sessionKey);
    
    console.log(`New session initialized: ${sessionKey}`);
  } else {
    console.log(`Existing session loaded: ${sessionKey}`);
    
    // Make sure stats exist for existing sessions
    const statsKey = `${USER_DATA_PREFIX}${sessionKey}${STATS_KEY_SUFFIX}`;
    if (!localStorage.getItem(statsKey)) {
      initializeSessionStats(sessionKey);
    }
  }
};

// Initialize session statistics
const initializeSessionStats = (sessionKey: string): void => {
  const statsKey = `${USER_DATA_PREFIX}${sessionKey}${STATS_KEY_SUFFIX}`;
  const initialStats = {
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    totalStudyTime: 0, // in minutes
    studySessions: 0,
    cardsReviewed: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    streakDays: 0,
    lastStudyDate: null,
    studyDays: [],
    averageScore: 0
  };
  
  localStorage.setItem(statsKey, JSON.stringify(initialStats));
};

// Update session statistics
export const updateSessionStats = (updates: Record<string, any>): void => {
  const sessionKey = getSessionKey();
  if (!sessionKey) return;
  
  const statsKey = `${USER_DATA_PREFIX}${sessionKey}${STATS_KEY_SUFFIX}`;
  const statsData = localStorage.getItem(statsKey);
  
  if (statsData) {
    try {
      const stats = JSON.parse(statsData);
      const updatedStats = { ...stats, ...updates };
      
      // Calculate average score if we have answers
      if (updates.correctAnswers !== undefined || updates.incorrectAnswers !== undefined) {
        const totalCorrect = updatedStats.correctAnswers || 0;
        const totalAnswers = (updatedStats.correctAnswers || 0) + (updatedStats.incorrectAnswers || 0);
        
        if (totalAnswers > 0) {
          updatedStats.averageScore = Math.round((totalCorrect / totalAnswers) * 100);
        }
      }
      
      // Update study streak
      if (updates.lastStudyDate) {
        const today = new Date().toISOString().split('T')[0];
        const lastStudyDate = new Date(stats.lastStudyDate || 0).toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        // Add today to study days if not already there
        if (!updatedStats.studyDays.includes(today)) {
          updatedStats.studyDays.push(today);
        }
        
        // Update streak
        if (lastStudyDate === yesterday) {
          updatedStats.streakDays += 1;
        } else if (lastStudyDate !== today) {
          updatedStats.streakDays = 1;
        }
      }
      
      localStorage.setItem(statsKey, JSON.stringify(updatedStats));
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  } else {
    // Initialize stats if they don't exist
    initializeSessionStats(sessionKey);
    updateSessionStats(updates);
  }
};

// Get session statistics
export const getSessionStats = (): Record<string, any> | null => {
  const sessionKey = getSessionKey();
  if (!sessionKey) return null;
  
  const statsKey = `${USER_DATA_PREFIX}${sessionKey}${STATS_KEY_SUFFIX}`;
  const statsData = localStorage.getItem(statsKey);
  
  if (statsData) {
    try {
      return JSON.parse(statsData);
    } catch (error) {
      console.error("Error parsing stats:", error);
      return null;
    }
  }
  
  return null;
};

// Get all localStorage keys associated with a session
const getUserDataKeys = (sessionKey: string): string[] => {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`${USER_DATA_PREFIX}${sessionKey}`)) {
      keys.push(key);
    }
  }
  return keys;
};

// Link user data to session key
// This function associates all user data with their session key
export const linkUserDataToSession = (sessionKey: string): void => {
  // In a real-world scenario, this would be handled by a backend service
  // For now, we're using localStorage as our "database"
  
  // Make sure the session is initialized
  initializeUserDataForSession(sessionKey);
  
  console.log(`User data linked to session: ${sessionKey}`);
};

// Export session data for backup
export const exportSessionData = (): string => {
  // In a real app, this would gather all user data and create an export
  const sessionKey = getSessionKey();
  if (!sessionKey) {
    return "";
  }
  
  // Collect all user data for this session
  const exportData = {
    sessionKey,
    exportDate: new Date().toISOString(),
    userData: {}
  };
  
  // Get all data keys for this session
  const userDataKeys = getUserDataKeys(sessionKey);
  userDataKeys.forEach(key => {
    const dataKey = key.replace(`${USER_DATA_PREFIX}${sessionKey}_`, '');
    const dataValue = localStorage.getItem(key);
    if (dataValue) {
      // @ts-ignore
      exportData.userData[dataKey] = JSON.parse(dataValue);
    }
  });
  
  return JSON.stringify(exportData);
};

// Import session data from backup
export const importSessionData = (data: string): boolean => {
  try {
    const importData = JSON.parse(data);
    if (!importData.sessionKey) {
      return false;
    }
    
    const sessionKey = importData.sessionKey;
    
    // Save the session key first
    saveSessionKey(sessionKey);
    
    // Import all user data
    if (importData.userData) {
      Object.entries(importData.userData).forEach(([key, value]) => {
        localStorage.setItem(`${USER_DATA_PREFIX}${sessionKey}_${key}`, JSON.stringify(value));
      });
    }
    
    // Make sure stats are initialized
    if (!importData.userData?.stats) {
      initializeSessionStats(sessionKey);
    }
    
    console.log(`Session data imported successfully: ${sessionKey}`);
    return true;
  } catch (error) {
    console.error("Failed to import session data:", error);
    return false;
  }
};

// Get remaining session time in days
export const getSessionRemainingDays = (): number | null => {
  const expiryDateString = localStorage.getItem(SESSION_EXPIRY_KEY);
  if (!expiryDateString) return null;
  
  const expiryDate = new Date(expiryDateString);
  const currentDate = new Date();
  
  // Calculate difference in days
  const diffTime = expiryDate.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays); // Don't return negative days
};

// Update the statistics when studying cards
export const recordCardStudy = (isCorrect: boolean, studyTimeMinutes: number = 1): void => {
  updateSessionStats({
    cardsReviewed: 1, // Increment by 1
    correctAnswers: isCorrect ? 1 : 0,
    incorrectAnswers: isCorrect ? 0 : 1,
    totalStudyTime: studyTimeMinutes,
    studySessions: 1,
    lastStudyDate: new Date().toISOString()
  });
};

// Get study streak
export const getStudyStreak = (): number => {
  const stats = getSessionStats();
  return stats?.streakDays || 0;
};
