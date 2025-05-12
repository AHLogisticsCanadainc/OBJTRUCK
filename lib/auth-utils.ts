/**
 * Utility functions for authentication
 */

/**
 * Thoroughly cleans up all auth-related data from the browser
 * This helps ensure a complete sign out experience
 */
export function cleanupAuthData() {
  console.log("Cleaning up auth data...")

  // Clear local storage items related to auth
  if (typeof window !== "undefined") {
    const authItems = [
      "sb-access-token",
      "sb-refresh-token",
      "sb-auth-token",
      "supabase.auth.token",
      "lastActiveTime",
      "rememberMe",
      "supabase-auth-token",
    ]

    authItems.forEach((item) => {
      localStorage.removeItem(item)
    })
  }

  // Clear any IndexedDB data if applicable
  try {
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

  // Clear any auth-related cookies
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
 * Check if the user is authenticated based on Supabase session
 * This is a quick check that doesn't validate the token with the server
 */
export async function isLocallyAuthenticated(): Promise<boolean> {
  try {
    // Import getSupabaseClient dynamically to avoid circular dependencies
    const { getSupabaseClient } = await import("@/lib/database")
    const supabase = getSupabaseClient()

    if (!supabase) return false

    const { data } = await supabase.auth.getSession()
    return !!data.session
  } catch (e) {
    console.error("Error checking local authentication:", e)
    return false
  }
}
