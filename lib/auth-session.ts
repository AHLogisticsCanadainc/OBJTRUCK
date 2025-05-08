import { supabase } from "@/lib/database"

/**
 * Utility function to refresh the auth token
 * @returns Object with success status and session data or error
 */
export async function refreshAuthToken() {
  console.log("🔄 Attempting to refresh auth token...")
  try {
    // First check if we have a session before trying to refresh
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session) {
      console.log("❌ No session found to refresh")
      return { success: false, error: new Error("No session to refresh") }
    }

    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      console.error("❌ Error refreshing token:", error.message)

      // Check if this is a network error
      if (error.message.includes("network") || error.message.includes("fetch")) {
        return {
          success: false,
          error,
          networkError: true,
        }
      }

      return { success: false, error }
    }

    console.log("✅ Token refreshed successfully")

    // Update last active time
    if (typeof window !== "undefined") {
      localStorage.setItem("lastActiveTime", Date.now().toString())
    }

    return { success: true, session: data.session }
  } catch (error) {
    console.error("❌ Exception refreshing token:", error)
    return { success: false, error }
  }
}

/**
 * Check if the current session is valid
 * @returns Object with validity status, session data, and error information
 */
export async function checkSession() {
  console.log("🔍 Checking session validity...")
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("❌ Error checking session:", error.message)
      return {
        valid: false,
        error,
        errorType: "fetch_error",
      }
    }

    if (!data.session) {
      console.log("⚠️ No session found")
      return {
        valid: false,
        reason: "No session found",
        errorType: "no_session",
      }
    }

    // Check if session is expired or about to expire
    const expiresAt = data.session.expires_at ? new Date(data.session.expires_at * 1000) : null
    const now = new Date()

    if (expiresAt && expiresAt < now) {
      console.log("⚠️ Session expired at", expiresAt.toISOString())
      return {
        valid: false,
        reason: "Session expired",
        expiresAt: expiresAt.toISOString(),
        errorType: "expired",
      }
    }

    // Check if session expires in less than 5 minutes
    const expiresInMs = expiresAt ? expiresAt.getTime() - now.getTime() : 0
    const expiresInMinutes = Math.floor(expiresInMs / (60 * 1000))

    if (expiresAt && expiresInMs < 5 * 60 * 1000) {
      console.log(`⚠️ Session expires soon (in ${expiresInMinutes} minutes), refreshing...`)
      // Session is about to expire, try to refresh it
      const refreshResult = await refreshAuthToken()
      if (!refreshResult.success) {
        console.error("❌ Failed to refresh session:", refreshResult.error)
        return {
          valid: false,
          reason: "Failed to refresh session",
          error: refreshResult.error,
          expiresInMinutes,
          errorType: "refresh_failed",
        }
      }
      console.log("✅ Session refreshed successfully")
      return {
        valid: true,
        session: refreshResult.session,
        refreshed: true,
        expiresInMinutes: 60, // Assume new token is valid for at least 60 minutes
      }
    }

    console.log(`✅ Session valid (expires in ${expiresInMinutes} minutes)`)
    return {
      valid: true,
      session: data.session,
      expiresInMinutes,
    }
  } catch (error) {
    console.error("❌ Exception checking session:", error)
    return {
      valid: false,
      error,
      errorType: "exception",
    }
  }
}

/**
 * Initialize auth listeners for the application
 * This should be called once at app startup
 */
export function initAuthListeners() {
  console.log("🔄 Initializing auth listeners...")
  // Set up auth state change listener
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    console.log("🔔 Auth state changed:", event)

    // You can dispatch events or update global state here
    if (event === "SIGNED_OUT") {
      console.log("👋 User signed out, clearing local auth state")
      // Clear any local auth state
      if (typeof window !== "undefined") {
        localStorage.removeItem("authUser")
      }
    } else if (event === "SIGNED_IN") {
      console.log("🎉 User signed in successfully")
    } else if (event === "TOKEN_REFRESHED") {
      console.log("🔄 Auth token refreshed")
    }
  })

  return data.subscription
}

/**
 * Check if a session is about to expire
 * @param expiresAt Timestamp when the session expires (in milliseconds)
 * @param thresholdMinutes Minutes threshold to consider "about to expire"
 * @returns Boolean indicating if the session is about to expire
 */
export function isSessionAboutToExpire(expiresAt: number, thresholdMinutes = 30): boolean {
  const now = Date.now()
  const expiresInMs = expiresAt - now
  const thresholdMs = thresholdMinutes * 60 * 1000
  const expiresInMinutes = Math.floor(expiresInMs / (60 * 1000))

  const isExpiringSoon = expiresInMs < thresholdMs
  if (isExpiringSoon) {
    console.log(`⚠️ Session expires in ${expiresInMinutes} minutes (threshold: ${thresholdMinutes} minutes)`)
  }

  return isExpiringSoon
}

/**
 * Get the remaining time for a session in a human-readable format
 * @param expiresAt Timestamp when the session expires (in milliseconds)
 * @returns String with the remaining time
 */
export function getSessionRemainingTime(expiresAt: number): string {
  const now = Date.now()
  const remainingMs = Math.max(0, expiresAt - now)

  const minutes = Math.floor(remainingMs / (60 * 1000))
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }

  return `${minutes}m`
}

/**
 * Handle session errors and determine if a redirect is needed
 * @param error The error object
 * @returns Boolean indicating if a redirect is needed
 */
export function handleSessionError(error: any): boolean {
  if (!error) return false

  // Check for specific error types that indicate we need to redirect
  const errorMessage = typeof error.message === "string" ? error.message.toLowerCase() : ""

  if (
    errorMessage.includes("jwt expired") ||
    errorMessage.includes("invalid token") ||
    errorMessage.includes("not authenticated") ||
    errorMessage.includes("session expired")
  ) {
    console.error("🔑 Authentication error detected:", errorMessage)
    return true
  }

  // Check error codes
  const errorCode = error.code || error.statusCode
  if (errorCode === 401 || errorCode === 403 || errorCode === "PGRST301") {
    console.error("🔑 Authentication error code detected:", errorCode)
    return true
  }

  return false
}

/**
 * Debug function to log session details
 * @param session The session object to debug
 */
export function debugSession(session: any) {
  if (!session) {
    console.log("📊 Debug: No session available")
    return
  }

  try {
    const expiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null

    const now = new Date()
    const expiresInMs = expiresAt ? expiresAt.getTime() - now.getTime() : 0
    const expiresInMinutes = Math.floor(expiresInMs / (60 * 1000))

    console.log("📊 Session Debug Info:")
    console.log(`  • User ID: ${session.user?.id || "Unknown"}`)
    console.log(`  • Expires: ${expiresAt ? expiresAt.toISOString() : "Unknown"}`)
    console.log(`  • Expires in: ${expiresInMinutes} minutes`)
    console.log(`  • Token length: ${session.access_token?.length || 0} chars`)
    console.log(`  • Created at: ${session.created_at ? new Date(session.created_at).toISOString() : "Unknown"}`)
  } catch (error) {
    console.error("❌ Error debugging session:", error)
  }
}

/**
 * Check if the current network is online
 * @returns Boolean indicating if the network is online
 */
export function isNetworkOnline(): boolean {
  if (typeof navigator !== "undefined" && "onLine" in navigator) {
    return navigator.onLine
  }
  return true // Assume online if we can't determine
}

/**
 * Handle session errors with network awareness
 * @param error The error object
 * @returns Object with error details and recommended actions
 */
export function analyzeSessionError(error: any): {
  isAuthError: boolean
  isNetworkError: boolean
  message: string
  recommendedAction: "retry" | "redirect" | "wait"
} {
  const isNetworkError =
    !isNetworkOnline() ||
    (error &&
      typeof error.message === "string" &&
      (error.message.includes("network") || error.message.includes("fetch") || error.message.includes("connection")))

  const isAuthError = handleSessionError(error)

  let message = "Unknown error occurred"
  let recommendedAction: "retry" | "redirect" | "wait" = "retry"

  if (isNetworkError) {
    message = "Network connection issue. Please check your internet connection."
    recommendedAction = "wait"
  } else if (isAuthError) {
    message = "Your session has expired. Please sign in again."
    recommendedAction = "redirect"
  } else if (error) {
    message = typeof error.message === "string" ? error.message : "An error occurred with the authentication service"
    recommendedAction = "retry"
  }

  return {
    isAuthError,
    isNetworkError,
    message,
    recommendedAction,
  }
}
