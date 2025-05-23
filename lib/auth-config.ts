/**
 * Auth Configuration
 *
 * This file contains configurations for authentication using Supabase Auth.
 */

// Redirect URLs after auth actions
export const authRedirects = {
  afterSignIn: "/",
  afterSignOut: "/auth/signin",
}

// Auth form defaults
export const authDefaults = {
  session: {
    defaultExpirationHours: 8, // Default session duration
    inactivityTimeoutHours: 1, // Timeout after inactivity
  },
  security: {
    maxLoginAttempts: 5, // Maximum failed login attempts before blocking
    blockDurationMinutes: 15, // Duration to block login after max attempts
  },
  passwordMinLength: 12, // Increased from 8 to 12 for better security
  passwordRequiresSpecialChar: true,
  passwordRequiresNumber: true,
  passwordRequiresUppercase: true,
  passwordRequiresLowercase: true, // Added lowercase requirement
  loginAttempts: {
    max: 5,
    lockoutMinutes: 15,
  },
}

// Environment variables required for Auth
export const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
]

// Validate that all required environment variables are set
export const validateEnvironment = () => {
  const missing = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`)
    return false
  }

  return true
}

// Validate security configuration
export function validateSecurityConfig() {
  const issues = []

  if (authDefaults.passwordMinLength < 12) {
    issues.push("Password minimum length should be at least 12 characters")
  }

  if (!authDefaults.passwordRequiresSpecialChar) {
    issues.push("Passwords should require special characters")
  }

  if (!authDefaults.passwordRequiresNumber) {
    issues.push("Passwords should require numbers")
  }

  if (!authDefaults.passwordRequiresUppercase) {
    issues.push("Passwords should require uppercase letters")
  }

  if (!authDefaults.passwordRequiresLowercase) {
    issues.push("Passwords should require lowercase letters")
  }

  if (authDefaults.security.maxLoginAttempts > 10) {
    issues.push("Maximum login attempts should not exceed 10")
  }

  if (authDefaults.security.blockDurationMinutes < 15) {
    issues.push("Lockout duration should be at least 15 minutes")
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}
