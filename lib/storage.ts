/**
 * SSR-safe storage wrapper
 * Prevents hydration errors by checking for window availability
 */

export const storage = {
  /**
   * Get item from localStorage (SSR-safe)
   * @param key - The storage key
   * @returns The stored value or null
   */
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item from storage: ${key}`, error);
      return null;
    }
  },

  /**
   * Set item in localStorage (SSR-safe)
   * @param key - The storage key
   * @param value - The value to store
   */
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item in storage: ${key}`, error);
    }
  },

  /**
   * Remove item from localStorage (SSR-safe)
   * @param key - The storage key
   */
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from storage: ${key}`, error);
    }
  },

  /**
   * Clear all items from localStorage (SSR-safe)
   */
  clear: (): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing storage", error);
    }
  },
};
