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
  REMEMBER_ME: "rememberMe", // New key for remember me setting
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
  const token = tokenStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN)
  if (token) {
    console.log(`🔑 Access token found (${token.length} chars)`)
  } else {
    console.log("⚠️ Access token not found in storage")
  }
  return token
}

/**
 * Get the current refresh token
 */
export function getRefreshToken(): string | null {
  const token = tokenStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN)
  if (token) {
    console.log(`🔄 Refresh token found (${token.length} chars)`)
  }
  return token
}

/**
 * Store authentication tokens
 */
export function storeTokens(accessToken: string, refreshToken: string, expiresAt: number): void {
  tokenStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, accessToken)
  tokenStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
  tokenStorage.setItem(TOKEN_STORAGE_KEYS.EXPIRES_AT, expiresAt.toString())

  const expiryDate = new Date(expiresAt)
  console.log(`🔒 Tokens stored. Access token will expire at ${expiryDate.toLocaleString()}`)

  updateLastActiveTime()
}

/**
 * Clear all authentication tokens
 */
export function clearTokens(): void {
  console.log("🧹 Clearing all authentication tokens")
  Object.values(TOKEN_STORAGE_KEYS).forEach((key) => {
    tokenStorage.removeItem(key)
  })
}

/**
 * Get token expiration time
 */
export function getTokenExpirationTime(): number | null {
  const expiresAtStr = tokenStorage.getItem(TOKEN_STORAGE_KEYS.EXPIRES_AT)
  if (!expiresAtStr) {
    console.log("⚠️ Token expiration time not found in storage")
    return null
  }

  try {
    const expiresAt = Number.parseInt(expiresAtStr, 10)
    const expiryDate = new Date(expiresAt)
    console.log(`🔒 Token expiration time: ${expiryDate.toLocaleString()}`)
    return expiresAt
  } catch (error) {
    console.error("❌ Error parsing token expiration time", error)
    return null
  }
}

/**
 * Check if the current token is expired
 */
export function isTokenExpired(): boolean {
  try {
    const expiryTime = getTokenExpirationTime()
    if (!expiryTime) return true

    // Check if the token has expired
    return Date.now() >= expiryTime
  } catch (error) {
    console.error("❌ Error checking token expiration:", error)
    // If there's an error, assume the token is expired to be safe
    return true
  }
}

/**
 * Check if the token is about to expire within the specified time
 */
export function isTokenExpiringSoon(thresholdMs: number = 5 * 60 * 1000): boolean {
  const expiresAt = getTokenExpirationTime()
  if (!expiresAt) return true

  const isExpiringSoon = expiresAt - Date.now() < thresholdMs

  if (isExpiringSoon) {
    const expiryDate = new Date(expiresAt)
    const remainingMs = expiresAt - Date.now()
    const remainingMinutes = Math.floor(remainingMs / (60 * 1000))
    console.log(`⚠️ Token expiring soon at ${expiryDate.toLocaleString()} (${remainingMinutes} minutes remaining)`)
  }

  return isExpiringSoon
}

/**
 * Update the last active timestamp
 */
export function updateLastActiveTime(): void {
  const now = Date.now()
  tokenStorage.setItem(TOKEN_STORAGE_KEYS.LAST_ACTIVE, now.toString())
  console.log(`⏱️ Last active time updated: ${new Date(now).toLocaleString()}`)
}

/**
 * Get the last active timestamp
 */
export function getLastActiveTime(): number | null {
  const lastActiveStr = tokenStorage.getItem(TOKEN_STORAGE_KEYS.LAST_ACTIVE)
  if (!lastActiveStr) return null

  try {
    const lastActive = Number.parseInt(lastActiveStr, 10)
    console.log(`⏱️ Last active time: ${new Date(lastActive).toLocaleString()}`)
    return lastActive
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

  const inactiveMs = Date.now() - lastActive
  const inactiveMinutes = Math.floor(inactiveMs / (60 * 1000))

  const isTooLong = inactiveMs > maxInactiveMs

  if (isTooLong) {
    console.log(
      `⚠️ User inactive for ${inactiveMinutes} minutes, exceeding limit of ${Math.floor(maxInactiveMs / (60 * 1000))} minutes`,
    )
  } else {
    console.log(`✅ User active within the last ${inactiveMinutes} minutes`)
  }

  return isTooLong
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
    console.log(`👤 User data stored for user: ${userData.id}`)
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

  const isValid = hasAccessToken && hasUserData && notExpired

  console.log(`🔒 Auth data validation: ${isValid ? "Valid" : "Invalid"}`)
  console.log(`  • Has access token: ${hasAccessToken ? "Yes" : "No"}`)
  console.log(`  • Has user data: ${hasUserData ? "Yes" : "No"}`)
  console.log(`  • Not expired: ${notExpired ? "Yes" : "No"}`)

  return isValid
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

  const expiryDate = new Date(expiresAt)
  const formattedExpiry = expiryDate.toLocaleString()

  let timeRemaining
  if (hours > 0) {
    timeRemaining = `${hours}h ${minutes % 60}m`
  } else {
    timeRemaining = `${minutes}m`
  }

  return `${timeRemaining} (expires at ${formattedExpiry})`
}

/**
 * Get exact expiration time as a formatted string
 */
export function getExactExpirationTime(): string {
  const expiresAt = getTokenExpirationTime()
  if (!expiresAt) return "Unknown"

  return new Date(expiresAt).toLocaleString()
}

/**
 * Verify token is accessible and valid
 * @returns Object with verification results
 */
export function verifyTokenAccessibility(): {
  tokenFound: boolean
  expiryTimeFound: boolean
  tokenValid: boolean
  expiresAt: string | null
} {
  const token = getAccessToken()
  const expiryTime = getTokenExpirationTime()

  const tokenFound = !!token
  const expiryTimeFound = !!expiryTime
  const tokenValid = tokenFound && expiryTimeFound && !isTokenExpired()
  const expiresAt = expiryTime ? new Date(expiryTime).toLocaleString() : null

  console.log(`🔍 Token verification results:`)
  console.log(`  • Token found: ${tokenFound ? "Yes" : "No"}`)
  console.log(`  • Expiry time found: ${expiryTimeFound ? "Yes" : "No"}`)
  console.log(`  • Token valid: ${tokenValid ? "Yes" : "No"}`)
  console.log(`  • Expires at: ${expiresAt || "Unknown"}`)

  return {
    tokenFound,
    expiryTimeFound,
    tokenValid,
    expiresAt,
  }
}

/**
 * Store the "Remember Me" preference
 */
export function setRememberMe(remember: boolean): void {
  tokenStorage.setItem(TOKEN_STORAGE_KEYS.REMEMBER_ME, remember ? "true" : "false")
  console.log(`🔒 Remember Me preference set to: ${remember}`)
}

/**
 * Get the "Remember Me" preference
 */
export function getRememberMe(): boolean {
  const rememberMe = tokenStorage.getItem(TOKEN_STORAGE_KEYS.REMEMBER_ME)
  return rememberMe === "true"
}

/**
 * Calculate session expiration based on "Remember Me" preference
 */
export function calculateSessionExpiration(rememberMe: boolean): number {
  const now = Date.now()

  if (rememberMe) {
    // Extended session (30 days)
    const days = 30
    console.log(`🔒 Using extended session duration: ${days} days`)
    return now + days * 24 * 60 * 60 * 1000
  } else {
    // Default session (8 hours)
    const hours = 8
    console.log(`🔒 Using default session duration: ${hours} hours`)
    return now + hours * 60 * 60 * 1000
  }
}
