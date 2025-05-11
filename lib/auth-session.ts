import { supabase } from "@/lib/database"
import {
  storeTokens,
  isTokenExpiringSoon,
  updateLastActiveTime,
  getTokenExpirationFormatted,
  getAccessToken,
  getTokenExpirationTime,
  hasValidAuthData,
} from "@/lib/token-service"

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

    // Set a timeout to prevent hanging on network issues
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Token refresh timed out")), 8000)
    })

    // Refresh the session
    const refreshPromise = supabase.auth.refreshSession()

    // Race the refresh against the timeout
    const { data, error } = (await Promise.race([
      refreshPromise,
      timeoutPromise.then(() => {
        throw new Error("Token refresh timed out")
      }),
    ])) as any

    if (error) {
      console.error("❌ Error refreshing token:", error.message)

      // Check if this is a network error
      if (error.message.includes("network") || error.message.includes("fetch") || error.message.includes("timeout")) {
        return {
          success: false,
          error,
          networkError: true,
        }
      }

      return { success: false, error }
    }

    console.log("✅ Token refreshed successfully")

    // Store the refreshed tokens
    if (data.session) {
      const expiresAt = data.session.expires_at
        ? new Date(data.session.expires_at * 1000).getTime()
        : Date.now() + 8 * 60 * 60 * 1000

      storeTokens(data.session.access_token, data.session.refresh_token || "", expiresAt)
    }

    // Update last active time
    updateLastActiveTime()

    return { success: true, session: data.session }
  } catch (error) {
    console.error("❌ Exception refreshing token:", error)

    // Check if this is a network error
    if (
      error instanceof Error &&
      (error.message.includes("network") || error.message.includes("fetch") || error.message.includes("timeout"))
    ) {
      return {
        success: false,
        error,
        networkError: true,
      }
    }

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
    // First check if we have valid auth data in local storage
    const hasValidLocalAuth = hasValidAuthData()
    console.log(`🔍 Local auth data valid: ${hasValidLocalAuth ? "Yes" : "No"}`)

    // If local auth is invalid, no need to check with server
    if (!hasValidLocalAuth) {
      return {
        valid: false,
        reason: "No valid local auth data",
        errorType: "no_local_auth",
      }
    }

    // Set a timeout to prevent hanging on network issues
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Session check timed out")), 8000) // Increased timeout
    })

    // Get session from Supabase
    const sessionPromise = supabase.auth.getSession()

    // Race the session check against the timeout
    try {
      const { data, error } = (await Promise.race([
        sessionPromise,
        timeoutPromise.then(() => {
          throw new Error("Session check timed out")
        }),
      ])) as any

      if (error) {
        console.error("❌ Error checking session:", error.message)

        // Check if this is a network error
        if (error.message.includes("network") || error.message.includes("fetch") || error.message.includes("timeout")) {
          return {
            valid: hasValidLocalAuth, // Fall back to local validation if network error
            error,
            errorType: "network_error",
            usingLocalValidation: true,
          }
        }

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
        console.log(`⚠️ Session expired at ${expiresAt.toLocaleString()}`)
        return {
          valid: false,
          reason: "Session expired",
          expiresAt: expiresAt.toISOString(),
          exactExpiryTime: expiresAt.toLocaleString(),
          errorType: "expired",
        }
      }

      // Check if session expires in less than 5 minutes
      const expiresInMs = expiresAt ? expiresAt.getTime() - now.getTime() : 0
      const expiresInMinutes = Math.floor(expiresInMs / (60 * 1000))

      if (expiresAt && expiresInMs < 5 * 60 * 1000) {
        console.log(
          `⚠️ Session expires soon at ${expiresAt.toLocaleString()} (in ${expiresInMinutes} minutes), refreshing...`,
        )
        // Session is about to expire, try to refresh it
        const refreshResult = await refreshAuthToken()
        if (!refreshResult.success) {
          console.error("❌ Failed to refresh session:", refreshResult.error)
          return {
            valid: false,
            reason: "Failed to refresh session",
            error: refreshResult.error,
            expiresInMinutes,
            exactExpiryTime: expiresAt.toLocaleString(),
            errorType: "refresh_failed",
          }
        }
        console.log("✅ Session refreshed successfully")

        // Get the new expiration time from the refreshed session
        const newExpiresAt = refreshResult.session?.expires_at
          ? new Date(refreshResult.session.expires_at * 1000)
          : new Date(Date.now() + 60 * 60 * 1000)

        return {
          valid: true,
          session: refreshResult.session,
          refreshed: true,
          expiresInMinutes: 60, // Assume new token is valid for at least 60 minutes
          exactExpiryTime: newExpiresAt.toLocaleString(),
        }
      }

      console.log(`✅ Session valid until ${expiresAt?.toLocaleString()} (expires in ${expiresInMinutes} minutes)`)
      return {
        valid: true,
        session: data.session,
        expiresInMinutes,
        exactExpiryTime: expiresAt?.toLocaleString(),
      }
    } catch (raceError) {
      // Handle timeout or other errors in the race
      console.error("❌ Session check race error:", raceError)

      // If there's a timeout, fall back to local validation
      if (raceError instanceof Error && raceError.message.includes("timeout")) {
        console.log("⚠️ Session check timed out, falling back to local validation")
        return {
          valid: hasValidLocalAuth,
          error: raceError,
          errorType: "timeout",
          usingLocalValidation: true,
        }
      }

      throw raceError // Re-throw for the outer catch
    }
  } catch (error) {
    console.error("❌ Exception checking session:", error)

    // If there's a network error, fall back to local validation
    if (
      error instanceof Error &&
      (error.message.includes("network") || error.message.includes("fetch") || error.message.includes("timeout"))
    ) {
      const locallyValid = hasValidAuthData()
      return {
        valid: locallyValid,
        error,
        errorType: "network_exception",
        usingLocalValidation: true,
        locallyValid,
      }
    }

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
      if (session?.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000)
        console.log(`🔒 Session will expire at ${expiresAt.toLocaleString()}`)
      }
    } else if (event === "TOKEN_REFRESHED") {
      console.log("🔄 Auth token refreshed")
      if (session?.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000)
        console.log(`🔒 New token will expire at ${expiresAt.toLocaleString()}`)
      }
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
  return isTokenExpiringSoon(thresholdMinutes * 60 * 1000)
}

/**
 * Get the remaining time for a session in a human-readable format
 * @param expiresAt Timestamp when the session expires (in milliseconds)
 * @returns String with the remaining time
 */
export function getSessionRemainingTime(expiresAt: number): string {
  return getTokenExpirationFormatted()
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
    console.log(`  • Exact expiry time: ${expiresAt ? expiresAt.toLocaleString() : "Unknown"}`)
    console.log(`  • Expires in: ${expiresInMinutes} minutes`)
    console.log(`  • Token length: ${session.access_token?.length || 0} chars`)
    console.log(`  • Created at: ${session.created_at ? new Date(session.created_at).toISOString() : "Unknown"}`)

    // Verify token is findable
    const storedToken = getAccessToken()
    console.log(`  • Token findable: ${storedToken ? "Yes" : "No"}`)

    // Verify token expiration time
    const storedExpiryTime = getTokenExpirationTime()
    console.log(`  • Stored expiry time: ${storedExpiryTime ? new Date(storedExpiryTime).toLocaleString() : "Unknown"}`)

    // Check if token is valid according to our validation logic
    console.log(`  • Token valid according to validation: ${hasValidAuthData() ? "Yes" : "No"}`)
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

/**
 * Verify token validity with exact expiration time
 * @returns Object with validity status and expiration details
 */
export function verifyTokenValidity() {
  try {
    const token = getAccessToken()
    const expiryTime = getTokenExpirationTime()

    if (!token || !expiryTime) {
      console.log("❌ Token or expiry time not found")
      return {
        valid: false,
        reason: "Token or expiry time not found",
      }
    }

    const now = Date.now()
    const expiresAt = new Date(expiryTime)
    const expiresInMs = expiryTime - now
    const expiresInMinutes = Math.floor(expiresInMs / (60 * 1000))

    const isValid = now < expiryTime

    console.log(`🔒 Token verification: ${isValid ? "Valid" : "Invalid"}`)
    console.log(`🔒 Token expires at ${expiresAt.toLocaleString()} (in ${expiresInMinutes} minutes)`)

    return {
      valid: isValid,
      expiresAt: expiresAt.toLocaleString(),
      expiresInMinutes,
      tokenFound: !!token,
    }
  } catch (error) {
    console.error("❌ Error during token verification:", error)
    return {
      valid: false,
      reason: "Error during verification",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
