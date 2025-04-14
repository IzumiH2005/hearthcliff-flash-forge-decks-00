
// Session key management utilities

// Storage key constant
const STORAGE_KEY = "cds-flashcard-session-key";

// Generate a new session key
export const generateSessionKey = (): string => {
  return Math.random().toString(36).substring(2, 6).toUpperCase() + 
         Math.random().toString(36).substring(2, 6).toUpperCase() + 
         Math.random().toString(36).substring(2, 4).toUpperCase();
};

// Save session key to localStorage
export const saveSessionKey = (key: string): void => {
  localStorage.setItem(STORAGE_KEY, key);
};

// Get session key from localStorage
export const getSessionKey = (): string | null => {
  return localStorage.getItem(STORAGE_KEY);
};

// Remove session key (logout)
export const clearSessionKey = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Check if a session exists
export const hasSession = (): boolean => {
  return !!getSessionKey();
};

// Link user data to session key
// This function associates all user data with their session key
// In a real app, this would involve server communication
export const linkUserDataToSession = (sessionKey: string): void => {
  // In a real-world scenario, this would be handled by a backend service
  // For now, we're using localStorage as our "database"
  
  // Update all user-related localStorage items with the session key prefix
  // This is a simplified approach for the demo
  const userPrefix = `user_${sessionKey}_`;
  
  // We would typically have APIs to sync this data with a backend
  // For now, we're just making sure localStorage is properly keyed
  
  console.log(`User data linked to session: ${sessionKey}`);
};

// Export session data for backup
export const exportSessionData = (): string => {
  // In a real app, this would gather all user data and create an export
  // For now, we just return the session key itself
  const sessionKey = getSessionKey();
  if (!sessionKey) {
    return "";
  }
  
  // A real implementation would collect all user data
  const exportData = {
    sessionKey,
    exportDate: new Date().toISOString(),
  };
  
  return JSON.stringify(exportData);
};

// Import session data from backup
export const importSessionData = (data: string): boolean => {
  try {
    const importData = JSON.parse(data);
    if (importData.sessionKey) {
      saveSessionKey(importData.sessionKey);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to import session data:", error);
    return false;
  }
};
