/**
 * Token Error Handler - Centralized handling of token-related errors
 */

import { cleanupAuthData } from "./auth-utils"

// Define error types
export enum TokenErrorType {
  EXPIRED = "expired",
  INVALID = "invalid",
  MISSING = "missing",
  NETWORK = "network",
  REFRESH_FAILED = "refresh_failed",
  UNKNOWN = "unknown",
}

// Error response interface
export interface TokenErrorResponse {
  type: TokenErrorType
  message: string
  shouldRedirect: boolean
  shouldRetry: boolean
  retryDelay?: number
}

/**
 * Handle token errors consistently across the application
 *
 * @param error The error object or message
 * @returns TokenErrorResponse with handling instructions
 */
export function handleTokenError(error: any): TokenErrorResponse {
  // Default response
  const defaultResponse: TokenErrorResponse = {
    type: TokenErrorType.UNKNOWN,
    message: "An unknown authentication error occurred",
    shouldRedirect: false,
    shouldRetry: false,
  }

  // If no error, return default
  if (!error) return defaultResponse

  // Extract error message
  const errorMessage = error.message || error.toString()

  // Handle expired token
  if (
    errorMessage.includes("expired") ||
    errorMessage.includes("jwt expired") ||
    errorMessage.includes("token expired")
  ) {
    return {
      type: TokenErrorType.EXPIRED,
      message: "Your session has expired. Please sign in again.",
      shouldRedirect: true,
      shouldRetry: false,
    }
  }

  // Handle invalid token
  if (
    errorMessage.includes("invalid token") ||
    errorMessage.includes("invalid signature") ||
    errorMessage.includes("malformed")
  ) {
    // Clean up auth data for invalid tokens
    cleanupAuthData()

    return {
      type: TokenErrorType.INVALID,
      message: "Your authentication token is invalid. Please sign in again.",
      shouldRedirect: true,
      shouldRetry: false,
    }
  }

  // Handle missing token
  if (
    errorMessage.includes("missing token") ||
    errorMessage.includes("no token") ||
    errorMessage.includes("not authenticated")
  ) {
    return {
      type: TokenErrorType.MISSING,
      message: "Authentication required. Please sign in.",
      shouldRedirect: true,
      shouldRetry: false,
    }
  }

  // Handle network errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("timeout")
  ) {
    return {
      type: TokenErrorType.NETWORK,
      message: "Network error while validating your session. Please check your connection.",
      shouldRedirect: false,
      shouldRetry: true,
      retryDelay: 5000, // 5 seconds
    }
  }

  // Handle refresh failures
  if (errorMessage.includes("refresh") || errorMessage.includes("refresh_token")) {
    return {
      type: TokenErrorType.REFRESH_FAILED,
      message: "Unable to refresh your session. Please sign in again.",
      shouldRedirect: true,
      shouldRetry: false,
    }
  }

  // Default case - unknown error
  return {
    type: TokenErrorType.UNKNOWN,
    message: `Authentication error: ${errorMessage}`,
    shouldRedirect: false,
    shouldRetry: true,
    retryDelay: 3000, // 3 seconds
  }
}

/**
 * Prepare redirect with appropriate error message
 */
export function prepareAuthRedirect(pathname: string, errorType: TokenErrorType): void {
  if (typeof window === "undefined") return

  // Save current path for redirect after login
  sessionStorage.setItem("redirectAfterLogin", pathname)

  // Set appropriate error message based on error type
  let message = "Please sign in to continue."

  switch (errorType) {
    case TokenErrorType.EXPIRED:
      message = "Your session has expired. Please sign in again."
      break
    case TokenErrorType.INVALID:
      message = "Your authentication is invalid. Please sign in again."
      break
    case TokenErrorType.REFRESH_FAILED:
      message = "We couldn't refresh your session. Please sign in again."
      break
    case TokenErrorType.NETWORK:
      message = "Network issues prevented authentication. Please sign in again."
      break
    case TokenErrorType.MISSING:
      message = "Authentication required. Please sign in to continue."
      break
  }

  sessionStorage.setItem("authRedirectReason", message)
}
