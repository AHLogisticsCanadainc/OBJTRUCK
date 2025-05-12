"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getSupabaseClient } from "@/lib/database"
import { trackLoginAttempt, resetLoginAttempts, logSecurityEvent } from "@/lib/security"
import { cleanupAuthData } from "@/lib/auth-utils"
import { authDefaults } from "@/lib/auth-config"

// Define the shape of the Session object
interface Session {
  token: string
  expiresAt: number
  userId: string
  deviceInfo: {
    browser: string
    os: string
    ip: string
    lastActive: string
  }
}

// Get the Supabase client (singleton)
const supabase = getSupabaseClient()

// Define the shape of our user object
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  lastLogin: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  session: Session | null
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean
    message?: string
  }>
  signOut: () => void
  refreshSession: () => Promise<boolean>
  resetAuthState: () => void
  immediateTokenVerify: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  session: null,
  signIn: async () => ({ success: false }),
  signOut: () => {},
  refreshSession: async () => false,
  resetAuthState: () => {},
  immediateTokenVerify: async () => false,
})

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [authError, setAuthError] = useState<Error | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Function to create a user profile from Supabase user data
  const createUserProfile = (userData: any): User => {
    return {
      id: userData.id,
      name: userData.user_metadata?.full_name || "User",
      email: userData.email || "",
      role: "user",
      lastLogin: new Date().toISOString(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.user_metadata?.full_name || "User")}&background=random`,
    }
  }

  // Function to create a session object from Supabase session
  const createSessionObject = (supabaseSession: any): Session => {
    const expiresAt = supabaseSession.expires_at
      ? new Date(supabaseSession.expires_at * 1000).getTime()
      : Date.now() + authDefaults.session.defaultExpirationHours * 60 * 60 * 1000

    return {
      token: supabaseSession.access_token,
      expiresAt: expiresAt,
      userId: supabaseSession.user.id,
      deviceInfo: {
        browser: navigator.userAgent,
        os: navigator.platform,
        ip: "127.0.0.1", // In a real app, this would be the actual IP
        lastActive: new Date().toISOString(),
      },
    }
  }

  // Function to reset auth state
  const resetAuthState = useCallback(() => {
    console.log("🔄 Resetting auth state...")
    setIsLoading(true)
    setAuthChecked(false)
    setAuthError(null)
    checkAuthStatus()
  }, [])

  // Refresh session function that can be called from outside
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log("🔄 Refreshing session...")
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error("❌ Error refreshing session:", error)
        return false
      }

      if (data.session) {
        console.log("✅ Session refreshed successfully")

        // Update user and session state
        const userProfile = createUserProfile(data.session.user)
        setUser(userProfile)

        const sessionObject = createSessionObject(data.session)
        setSession(sessionObject)

        return true
      }

      return false
    } catch (error) {
      console.error("❌ Exception refreshing session:", error)
      return false
    }
  }, [])

  // Immediate token verification function
  const immediateTokenVerify = useCallback(async (): Promise<boolean> => {
    console.log("🔍 Performing immediate token verification...")

    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("❌ Error fetching session:", error)
        return false
      }

      if (!data.session) {
        console.log("⚠️ No session found")
        return false
      }

      // We have a valid session, set up the user
      console.log("✅ Valid session found, setting up user")

      const userProfile = createUserProfile(data.session.user)
      setUser(userProfile)

      const sessionObject = createSessionObject(data.session)
      setSession(sessionObject)

      setAuthChecked(true)
      setIsLoading(false)

      console.log("✅ User and session set successfully via immediate verification")
      return true
    } catch (error) {
      console.error("❌ Exception during immediate token verification:", error)
      setIsLoading(false)
      return false
    }
  }, [])

  // Sign out function
  const signOut = useCallback(async () => {
    setIsLoading(true)

    try {
      console.log("👋 Signing out user...")

      // Log the event before signing out if user exists
      if (user) {
        logSecurityEvent("logout", user.id, {
          sessionToken: session?.token,
        })
      }

      // Clear local state first to prevent UI flashing
      setUser(null)
      setSession(null)

      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("❌ Error signing out from Supabase:", error)
      }

      // Clean up all auth-related data
      cleanupAuthData()
      console.log("✅ Auth data cleaned up")

      // Use a small timeout to ensure state updates have propagated
      setTimeout(() => {
        console.log("🔄 Redirecting to sign in page")
        router.push("/auth/signin")
      }, 100)
    } catch (error) {
      console.error("❌ Error during sign out process:", error)
      // Force redirect to sign-in page even if there's an error
      router.push("/auth/signin")
    } finally {
      setIsLoading(false)
      console.log("✅ Sign out process completed")
    }
  }, [router, session, user])

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus()

    // Set up Supabase auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, supabaseSession) => {
      console.log("🔔 Auth state changed:", event)

      if (event === "SIGNED_IN" && supabaseSession) {
        console.log("✅ User signed in")

        // Create user profile
        const userProfile = createUserProfile(supabaseSession.user)
        setUser(userProfile)

        // Create session object
        const sessionObject = createSessionObject(supabaseSession)
        setSession(sessionObject)

        // Check if we need to redirect to a specific page after login
        const redirectPath = sessionStorage.getItem("redirectAfterLogin")
        if (redirectPath) {
          console.log("🔄 Redirecting to saved path after login:", redirectPath)
          sessionStorage.removeItem("redirectAfterLogin")
          router.push(redirectPath)
        } else {
          // Navigate to landing page after successful sign-in
          router.push("/dashboard")
        }
      } else if (event === "SIGNED_OUT") {
        console.log("👋 User signed out")
        setUser(null)
        setSession(null)
      } else if (event === "TOKEN_REFRESHED" && supabaseSession) {
        console.log("🔄 Token refreshed")

        // Update session object
        const sessionObject = createSessionObject(supabaseSession)
        setSession(sessionObject)
      } else if (event === "USER_UPDATED" && supabaseSession) {
        console.log("👤 User updated")

        // Update user profile
        const userProfile = createUserProfile(supabaseSession.user)
        setUser(userProfile)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Check auth status function
  const checkAuthStatus = async () => {
    setIsLoading(true)

    try {
      console.log("🔍 Checking auth status...")

      // Get the current session from Supabase
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("❌ Error getting session:", error)
        setUser(null)
        setSession(null)
        setAuthError(error)
      } else if (data.session) {
        console.log("✅ Session found:", data.session.user.id)

        // Create user profile
        const userProfile = createUserProfile(data.session.user)
        setUser(userProfile)

        // Create session object
        const sessionObject = createSessionObject(data.session)
        setSession(sessionObject)
      } else {
        console.log("⚠️ No session found")

        // Only redirect to sign-in if on a protected route
        const isAuthPage = pathname?.includes("/auth/")
        const isRootPage = pathname === "/"

        if (!isAuthPage && !isRootPage) {
          console.log("🔄 Redirecting to sign in page")

          // Store the current URL to redirect back after login
          if (typeof window !== "undefined" && pathname) {
            sessionStorage.setItem("redirectAfterLogin", pathname)
          }

          router.push("/auth/signin")
        }
      }
    } catch (error) {
      console.error("❌ Failed to check auth status:", error)
      setUser(null)
      setSession(null)
      setAuthError(error instanceof Error ? error : new Error("Unknown auth error"))
    } finally {
      setIsLoading(false)
      setAuthChecked(true)
      console.log("✅ Auth status check completed")
    }
  }

  // Sign in function
  const signIn = async (email: string, password: string) => {
    console.log("🔑 Attempting sign in...")

    // Input validation
    if (!email || !password) {
      return { success: false, message: "Please enter both username and password" }
    }

    // Check if the email is already a full email address
    if (!email.includes("@")) {
      return { success: false, message: "Invalid email format" }
    }

    // Extract username from email for validation
    const username = email.split("@")[0]

    // Validate username format
    const isValidUsername = (username: string): boolean => {
      const usernameRegex = /^[a-zA-Z0-9._-]+$/
      return usernameRegex.test(username)
    }

    if (!isValidUsername(username)) {
      return {
        success: false,
        message: "Username contains invalid characters. Use only letters, numbers, dots, underscores, or hyphens.",
      }
    }

    // Validate full email format
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    if (!isValidEmail(email)) {
      return { success: false, message: "Invalid email format" }
    }

    // Trim email to prevent issues with whitespace
    email = email.trim()

    // Check if the email domain is allowed
    if (!email.endsWith("@logisticcanada.ca")) {
      return { success: false, message: "Only @logisticcanada.ca email addresses are allowed" }
    }

    // Check login attempts
    const attemptStatus = trackLoginAttempt(email)
    if (attemptStatus.blocked) {
      return {
        success: false,
        message: `Too many failed attempts. Please try again in ${attemptStatus.blockDuration} minutes.`,
      }
    }

    try {
      console.log("🔑 Signing in user:", email)

      // Before signing in, clean up any existing auth data to prevent conflicts
      cleanupAuthData()

      // Set standard session duration
      const expiresIn = authDefaults.session.defaultExpirationHours * 60 * 60 // Default duration in seconds

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          expiresIn,
        },
      })

      if (error) {
        console.log("❌ Sign in error:", error)

        logSecurityEvent("failed_login", "unknown", {
          reason: "invalid_credentials",
          email,
        })

        return {
          success: false,
          message: `Invalid username or password. ${attemptStatus.remainingAttempts} attempts remaining.`,
        }
      }

      console.log("✅ Sign in successful")

      // Reset login attempts
      resetLoginAttempts(email)

      // Log successful login
      logSecurityEvent("login", data.user.id, {
        method: "password",
        email,
      })

      return { success: true }
    } catch (err) {
      console.error("❌ Sign in error:", err)
      return {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || !authChecked,
        session,
        signIn,
        signOut,
        refreshSession,
        resetAuthState,
        immediateTokenVerify,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
