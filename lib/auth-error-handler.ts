/**
 * Handles authentication errors and performs appropriate actions
 * @param error The error to handle
 * @param onAuthError Optional callback to execute on auth error
 * @returns true if the error was an auth error and was handled, false otherwise
 */
export function handleAuthError(error: any, onAuthError?: () => void): boolean {
  // Check if this is an auth error
  const isAuthError =
    error?.message?.includes("JWT") ||
    error?.message?.includes("token") ||
    error?.message?.includes("session") ||
    error?.message?.includes("auth") ||
    error?.message?.includes("unauthorized") ||
    error?.message?.includes("not authenticated") ||
    error?.__isAuthError === true

  if (isAuthError) {
    console.error("Authentication error:", error)

    // Execute the callback if provided
    if (onAuthError) {
      onAuthError()
    }

    return true
  }

  return false
}
