/**
 * Token Service - Centralized management of authentication tokens
 *
 * This service provides a consistent interface for storing, retrieving,
 * and managing authentication tokens across the application.
 */

// Storage keys
const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: "sb-access-token",
  REFRESH_TOKEN: "sb-refresh-token",
  EXPIRES_AT: "supabase.auth.expiresAt",
  USER: "supabase.auth.user",
  SESSION: "supabase.auth.token",
  LAST_ACTIVE: "lastActiveTime",
}

// Token storage interface
interface TokenStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

// Browser storage implementation
class BrowserTokenStorage implements TokenStorage {
  getItem(key: string): string | null {
    try {
      if (typeof window === "undefined") return null
      return localStorage.getItem(key)
    } catch (error) {
      console.error(`Error getting item from storage: ${key}`, error)
      return null
    }
  }

  setItem(key: string, value: string): void {
    try {
      if (typeof window === "undefined") return
      localStorage.setItem(key, value)
    } catch (error) {
      console.error(`Error setting item in storage: ${key}`, error)
    }
  }

  removeItem(key: string): void {
    try {
      if (typeof window === "undefined") return
      localStorage.setItem(key, "")
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing item from storage: ${key}`, error)
    }
  }
}

// Create storage instance
const tokenStorage = new BrowserTokenStorage()

/**
 * Get the current access token
 */
export function getAccessToken(): string | null {
  return tokenStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN)
}

/**
 * Get the current refresh token
 */
export function getRefreshToken(): string | null {
  return tokenStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN)
}

/**
 * Store authentication tokens
 */
export function storeTokens(accessToken: string, refreshToken: string, expiresAt: number): void {
  tokenStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, accessToken)
  tokenStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
  tokenStorage.setItem(TOKEN_STORAGE_KEYS.EXPIRES_AT, expiresAt.toString())
  updateLastActiveTime()
}

/**
 * Clear all authentication tokens
 */
export function clearTokens(): void {
  Object.values(TOKEN_STORAGE_KEYS).forEach((key) => {
    tokenStorage.removeItem(key)
  })
}

/**
 * Get token expiration time
 */
export function getTokenExpirationTime(): number | null {
  const expiresAtStr = tokenStorage.getItem(TOKEN_STORAGE_KEYS.EXPIRES_AT)
  if (!expiresAtStr) return null

  try {
    return Number.parseInt(expiresAtStr, 10)
  } catch (error) {
    console.error("Error parsing token expiration time", error)
    return null
  }
}

/**
 * Check if the current token is expired
 */
export function isTokenExpired(): boolean {
  const expiresAt = getTokenExpirationTime()
  if (!expiresAt) return true

  // Add a small buffer (30 seconds) to account for clock differences
  return Date.now() > expiresAt - 30000
}

/**
 * Check if the token is about to expire within the specified time
 */
export function isTokenExpiringSoon(thresholdMs: number = 5 * 60 * 1000): boolean {
  const expiresAt = getTokenExpirationTime()
  if (!expiresAt) return true

  return expiresAt - Date.now() < thresholdMs
}

/**
 * Update the last active timestamp
 */
export function updateLastActiveTime(): void {
  tokenStorage.setItem(TOKEN_STORAGE_KEYS.LAST_ACTIVE, Date.now().toString())
}

/**
 * Get the last active timestamp
 */
export function getLastActiveTime(): number | null {
  const lastActiveStr = tokenStorage.getItem(TOKEN_STORAGE_KEYS.LAST_ACTIVE)
  if (!lastActiveStr) return null

  try {
    return Number.parseInt(lastActiveStr, 10)
  } catch (error) {
    console.error("Error parsing last active time", error)
    return null
  }
}

/**
 * Check if user has been inactive for longer than the specified duration
 */
export function hasBeenInactiveTooLong(maxInactiveMs: number = 60 * 60 * 1000): boolean {
  const lastActive = getLastActiveTime()
  if (!lastActive) return true

  return Date.now() - lastActive > maxInactiveMs
}

/**
 * Get user data from storage
 */
export function getStoredUserData(): any | null {
  const userData = tokenStorage.getItem(TOKEN_STORAGE_KEYS.USER)
  if (!userData) return null

  try {
    return JSON.parse(userData)
  } catch (error) {
    console.error("Error parsing stored user data", error)
    return null
  }
}

/**
 * Store user data
 */
export function storeUserData(userData: any): void {
  if (!userData) return

  try {
    tokenStorage.setItem(TOKEN_STORAGE_KEYS.USER, JSON.stringify(userData))
  } catch (error) {
    console.error("Error storing user data", error)
  }
}

/**
 * Check if we have valid auth data stored
 */
export function hasValidAuthData(): boolean {
  const hasAccessToken = !!getAccessToken()
  const hasUserData = !!getStoredUserData()
  const notExpired = !isTokenExpired()

  return hasAccessToken && hasUserData && notExpired
}

/**
 * Get remaining time until token expiration in human-readable format
 */
export function getTokenExpirationFormatted(): string {
  const expiresAt = getTokenExpirationTime()
  if (!expiresAt) return "Expired"

  const remainingMs = Math.max(0, expiresAt - Date.now())
  const minutes = Math.floor(remainingMs / (60 * 1000))
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }

  return `${minutes}m`
}
