
/**
 * Generates or retrieves a unique user ID for this device/session
 * On web: uses localStorage with fallback to crypto.randomUUID()
 * In native containers: will be replaced with platform-specific IDs
 */
export function getUserId(): string {
  const STORAGE_KEY = 'cwp_uid';
  
  // Try to get existing ID from localStorage
  let userId = localStorage.getItem(STORAGE_KEY);
  
  if (!userId) {
    // Generate new UUID if none exists
    userId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, userId);
  }
  
  return userId;
}
