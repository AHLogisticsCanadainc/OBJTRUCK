import { clearTokens, getTokenExpirationTime as getTokenExpiration } from "@/lib/token-service"

/**
 * Utility functions for authentication
 */

/**
 * Thoroughly cleans up all auth-related data from the browser
 * This helps ensure a complete sign out experience
 */
export function cleanupAuthData() {
  console.log("Cleaning up auth data...")

  // Use the centralized token service to clear tokens
  clearTokens()

  // Clear any other auth-related state
  try {
    // Clear any IndexedDB data if applicable
    if (typeof window !== "undefined" && window.indexedDB) {
      const dbs = ["supabase", "auth", "session-store"]
      dbs.forEach((db) => {
        try {
          indexedDB.deleteDatabase(db)
        } catch (e) {
          console.error(`Failed to delete IndexedDB database ${db}:`, e)
        }
      })
    }
  } catch (e) {
    console.error("Error clearing IndexedDB:", e)
  }

  // Clear all auth-related cookies
  if (typeof document !== "undefined") {
    const cookiesToClear = [
      "sb-access-token",
      "sb-refresh-token",
      "sb-auth-token",
      "sb-provider",
      // Add any other auth-related cookies here
    ]

    cookiesToClear.forEach((cookieName) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    })
  }

  console.log("Auth data cleanup complete")
}

/**
 * Check if the user is authenticated based on local storage
 * This is a quick check that doesn't validate the token with the server
 */
function hasValidAuthData(): boolean {
  // Implement your logic to check for valid auth data here
  // For example, check if tokens exist in local storage or cookies
  // This is a placeholder implementation, replace with your actual logic
  return !!localStorage.getItem("sb-access-token") || !!localStorage.getItem("sb-refresh-token")
}

export function isLocallyAuthenticated(): boolean {
  try {
    return hasValidAuthData()
  } catch (e) {
    console.error("Error checking local authentication:", e)
    return false
  }
}

/**
 * Get the expiration time of the current auth token
 */
export function getTokenExpirationTime(): number | null {
  try {
    return getTokenExpiration()
  } catch (e) {
    console.error("Error getting token expiration time:", e)
    return null
  }
}
