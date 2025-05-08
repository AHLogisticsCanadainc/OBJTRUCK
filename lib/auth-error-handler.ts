/**
 * Utility functions for handling authentication errors
 */

import { cleanupAuthData } from "./auth-utils"

/**
 * Check if an error is a Supabase auth error
 */
export function isAuthError(error: any): boolean {
  return (
    error &&
    (error.__isAuthError === true ||
      (typeof error.message === "string" &&
        (error.message.includes("auth") ||
          error.message.includes("token") ||
          error.message.includes("session") ||
          error.message.includes("JWT") ||
          error.message.includes("expired") ||
          error.message.includes("authentication") ||
          error.message.includes("not authenticated") ||
          error.message.includes("sign in"))))
  )
}

/**
 * Check if an error is related to network connectivity
 */
export function isNetworkError(error: any): boolean {
  return (
    error &&
    typeof error.message === "string" &&
    (error.message.includes("network") ||
      error.message.includes("fetch") ||
      error.message.includes("connection") ||
      error.message.includes("offline") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("timeout"))
  )
}

/**
 * Check if an error is specifically a refresh token error
 */
export function isRefreshTokenError(error: any): boolean {
  return (
    isAuthError(error) &&
    typeof error.message === "string" &&
    (error.message.includes("refresh_token_not_found") ||
      error.message.includes("refresh token") ||
      error.message.includes("invalid refresh token"))
  )
}

/**
 * Handle auth errors gracefully
 * @param error The error to handle
 * @param onAuthError Callback to execute if this is an auth error
 * @returns true if the error was handled, false otherwise
 */
export function handleAuthError(error: any, onAuthError?: () => void): boolean {
  if (!error) return false

  // Check for network errors first
  if (isNetworkError(error)) {
    console.error("🌐 Network error detected:", error.message || error)
    // Don't clean up auth data for network errors - just report them
    return false
  }

  if (isAuthError(error)) {
    console.error("🔑 Auth error detected:", error.message || error)

    // Clean up auth data
    cleanupAuthData()

    // Store the reason for the redirect
    if (typeof window !== "undefined") {
      // Store a message to display on the sign-in page
      sessionStorage.setItem("authRedirectReason", "Your session has expired or is invalid. Please sign in again.")

      // Store the current URL to redirect back after login
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname)
    }

    // Execute callback if provided
    if (onAuthError) {
      onAuthError()
    }

    return true
  }

  return false
}

/**
 * Create a safe wrapper for Supabase auth operations
 * @param authOperation The auth operation to execute
 * @param fallbackValue The value to return if the operation fails
 * @param onAuthError Callback to execute if an auth error occurs
 */
export async function safeAuthOperation<T>(
  authOperation: () => Promise<T>,
  fallbackValue: T,
  onAuthError?: () => void,
): Promise<T> {
  try {
    return await authOperation()
  } catch (error) {
    console.error("Auth operation failed:", error)

    if (handleAuthError(error, onAuthError)) {
      return fallbackValue
    }

    throw error
  }
}

/**
 * Handle session timeout with a user-friendly approach
 * @param lastActiveTime The timestamp of the last user activity
 * @param maxInactiveTime Maximum allowed inactive time in milliseconds
 * @returns Object with timeout status and information
 */
export function handleSessionTimeout(
  lastActiveTime: number | null,
  maxInactiveTime: number = 60 * 60 * 1000, // Default 1 hour
): {
  isTimedOut: boolean
  inactiveTime: number
  remainingTime: number
  formattedInactiveTime: string
} {
  if (!lastActiveTime) {
    return {
      isTimedOut: false,
      inactiveTime: 0,
      remainingTime: maxInactiveTime,
      formattedInactiveTime: "0 minutes",
    }
  }

  const now = Date.now()
  const inactiveTime = now - lastActiveTime
  const isTimedOut = inactiveTime > maxInactiveTime
  const remainingTime = Math.max(0, maxInactiveTime - inactiveTime)

  // Format the inactive time in a human-readable way
  let formattedInactiveTime = ""
  if (inactiveTime < 60000) {
    formattedInactiveTime = `${Math.floor(inactiveTime / 1000)} seconds`
  } else if (inactiveTime < 3600000) {
    formattedInactiveTime = `${Math.floor(inactiveTime / 60000)} minutes`
  } else {
    const hours = Math.floor(inactiveTime / 3600000)
    const minutes = Math.floor((inactiveTime % 3600000) / 60000)
    formattedInactiveTime = `${hours} hour${hours !== 1 ? "s" : ""}${minutes > 0 ? ` ${minutes} minute${minutes !== 1 ? "s" : ""}` : ""}`
  }

  return {
    isTimedOut,
    inactiveTime,
    remainingTime,
    formattedInactiveTime,
  }
}
