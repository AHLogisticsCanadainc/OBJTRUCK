// Define types for login attempts
interface LoginAttempt {
  count: number
  lastAttempt: number
}

// Track login attempts
const loginAttempts: Record<string, LoginAttempt> = {}

// Clean up expired login attempts to prevent memory leaks
export function cleanupLoginAttempts(): void {
  const now = Date.now()
  const EXPIRY_TIME = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  Object.keys(loginAttempts).forEach((email) => {
    const timeElapsed = now - loginAttempts[email].lastAttempt
    if (timeElapsed > EXPIRY_TIME) {
      delete loginAttempts[email]
    }
  })
}

// Set up periodic cleanup if in browser environment
if (typeof window !== "undefined") {
  // Run cleanup every hour
  setInterval(cleanupLoginAttempts, 60 * 60 * 1000)
}

export function trackLoginAttempt(email: string): {
  blocked: boolean
  remainingAttempts: number
  blockDuration: number
} {
  const MAX_ATTEMPTS = 5
  const BLOCK_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds
  const now = Date.now()

  // Normalize email to prevent bypass via case variations
  const normalizedEmail = email.toLowerCase().trim()

  // Initialize if first attempt
  if (!loginAttempts[normalizedEmail]) {
    loginAttempts[normalizedEmail] = { count: 0, lastAttempt: now }
  }

  const attempt = loginAttempts[normalizedEmail]

  // Check if blocked
  if (attempt.count >= MAX_ATTEMPTS) {
    const timeElapsed = now - attempt.lastAttempt
    if (timeElapsed < BLOCK_DURATION) {
      // Still blocked
      const remainingBlockTime = Math.ceil((BLOCK_DURATION - timeElapsed) / 1000 / 60)
      return {
        blocked: true,
        remainingAttempts: 0,
        blockDuration: remainingBlockTime,
      }
    } else {
      // Block expired, reset counter
      attempt.count = 1 // Set to 1 for this attempt
      attempt.lastAttempt = now
      return {
        blocked: false,
        remainingAttempts: MAX_ATTEMPTS - 1,
        blockDuration: 0,
      }
    }
  }

  // Increment attempt counter
  attempt.count++
  attempt.lastAttempt = now

  return {
    blocked: attempt.count >= MAX_ATTEMPTS,
    remainingAttempts: MAX_ATTEMPTS - attempt.count,
    blockDuration: 0,
  }
}

// Reset login attempts for a user
export function resetLoginAttempts(email: string): void {
  const normalizedEmail = email.toLowerCase().trim()
  if (loginAttempts[normalizedEmail]) {
    loginAttempts[normalizedEmail].count = 0
  }
}

// Define types for security events
type SecurityEventType = "login" | "logout" | "failed_login"

interface SecurityEvent {
  eventType: SecurityEventType
  userId: string
  timestamp: string
  ipAddress: string
  userAgent: string
  details: Record<string, any>
}

// Audit logging
export function logSecurityEvent(
  eventType: SecurityEventType,
  userId: string,
  details: Record<string, any> = {},
): void {
  const event: SecurityEvent = {
    eventType,
    userId,
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1", // In a real app, this would be the actual IP
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
    details,
  }

  // In a real app, this would send to a secure logging service
  console.log("Security Event:", event)

  // Store in localStorage for demo purposes
  if (typeof window !== "undefined") {
    try {
      const auditLog = JSON.parse(localStorage.getItem("auditLog") || "[]")
      auditLog.push(event)
      localStorage.setItem("auditLog", JSON.stringify(auditLog))
    } catch (error) {
      console.error("Failed to log security event:", error)
    }
  }
}
