/**
 * Utility functions for authentication
 */

/**
 * Thoroughly cleans up all auth-related data from the browser
 * This helps ensure a complete sign out experience
 */
export function cleanupAuthData() {
  console.log("Cleaning up auth data...")

  // Clear localStorage items related to auth
  const authKeys = [
    "supabase.auth.token",
    "adminSession",
    "auditLog",
    "sb-access-token",
    "sb-refresh-token",
    "supabase.auth.refreshToken",
    "supabase.auth.expiresAt",
    "supabase.auth.provider",
    "supabase.auth.user",
    "authUser",
    // Add any other auth-related keys here
  ]

  if (typeof window !== "undefined" && window.localStorage) {
    authKeys.forEach((key) => {
      try {
        localStorage.removeItem(key)
      } catch (e) {
        console.error(`Failed to remove ${key} from localStorage:`, e)
      }
    })
  }

  // Clear sessionStorage items related to auth
  const sessionKeys = [
    "supabase.auth.token",
    "supabase.auth.refreshToken",
    "supabase.auth.expiresAt",
    "supabase.auth.provider",
    "supabase.auth.user",
    // Add any other auth-related session keys here
  ]

  if (typeof window !== "undefined" && window.sessionStorage) {
    sessionKeys.forEach((key) => {
      try {
        sessionStorage.removeItem(key)
      } catch (e) {
        console.error(`Failed to remove ${key} from sessionStorage:`, e)
      }
    })
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

  console.log("Auth data cleanup complete")
}

/**
 * Check if the user is authenticated based on local storage
 * This is a quick check that doesn't validate the token with the server
 */
export function isLocallyAuthenticated(): boolean {
  try {
    if (typeof window === "undefined") return false

    // Check for Supabase token in localStorage
    const hasToken = !!localStorage.getItem("supabase.auth.token")

    // Check for user data
    const hasUser = !!localStorage.getItem("supabase.auth.user")

    return hasToken && hasUser
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
    if (typeof window === "undefined") return null

    const expiresAtStr = localStorage.getItem("supabase.auth.expiresAt")
    if (!expiresAtStr) return null

    return Number.parseInt(expiresAtStr, 10)
  } catch (e) {
    console.error("Error getting token expiration time:", e)
    return null
  }
}
