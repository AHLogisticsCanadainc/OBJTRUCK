"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getSupabaseClient } from "@/lib/database"
import { trackLoginAttempt, resetLoginAttempts, logSecurityEvent } from "@/lib/security"
import { cleanupAuthData } from "@/lib/auth-utils"
import { testSupabaseConnection } from "@/lib/debug-utils"
import { checkSession, refreshAuthToken, debugSession } from "@/lib/auth-session"

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

// Update the AuthContextType interface to include immediateTokenVerify
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

// Update the default context value to include the new function
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

  // Function to reset auth state
  const resetAuthState = useCallback(() => {
    console.log("🔄 Resetting auth state...")
    setIsLoading(true)
    setAuthChecked(false)
    setAuthError(null)
    checkAuthStatus()
  }, [])

  // Add this function after the resetAuthState function
  // This will immediately verify the token and break out of loading state

  // Add this function after the resetAuthState function
  const immediateTokenVerify = useCallback(async (): Promise<boolean> => {
    console.log("🔍 Performing immediate token verification...")
    setIsLoading(true)

    try {
      // Get the Supabase client
      const supabase = getSupabaseClient()

      if (!supabase) {
        console.error("❌ Supabase client is undefined during immediate verification")
        setIsLoading(false)
        return false
      }

      // Try to get the session directly
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("❌ Error during immediate token verification:", error)
        setIsLoading(false)
        return false
      }

      if (!data.session) {
        console.log("⚠️ No session found during immediate verification")
        setIsLoading(false)
        return false
      }

      // We have a valid session, quickly set up the user
      console.log("✅ Session found during immediate verification")
      const profileSuccess = await fetchUserProfile(data.session.user.id)

      if (!profileSuccess) {
        console.log("⚠️ Failed to fetch user profile during immediate verification")
        setIsLoading(false)
        return false
      }

      // Create session object
      const expiresAt = data.session.expires_at
        ? new Date(data.session.expires_at * 1000).getTime()
        : Date.now() + 8 * 60 * 60 * 1000 // Default to 8 hours

      const browser = navigator.userAgent
      const os = navigator.platform

      const newSession: Session = {
        token: data.session.access_token,
        expiresAt: expiresAt,
        userId: data.session.user.id,
        deviceInfo: {
          browser,
          os,
          ip: "127.0.0.1", // In a real app, this would be the actual IP
          lastActive: new Date().toISOString(),
        },
      }

      setSession(newSession)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error("❌ Exception during immediate token verification:", error)
      setIsLoading(false)
      return false
    }
  }, [])

  // Update the test Supabase connection effect
  useEffect(() => {
    const runConnectionTest = async () => {
      try {
        const result = await testSupabaseConnection()
        if (!result.success) {
          console.error("❌ Supabase connection test failed:", result.error)
          setAuthError(new Error(`Supabase connection failed: ${result.error}`))
        } else {
          console.log("✅ Supabase connection test successful")
        }
      } catch (error) {
        console.error("❌ Error running Supabase connection test:", error)
        setAuthError(
          new Error(`Error testing Supabase connection: ${error instanceof Error ? error.message : "Unknown error"}`),
        )
      }
    }

    runConnectionTest()
  }, [])

  // Check if we have a valid session before attempting to refresh
  const hasValidSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log("🔍 Checking for valid session...")
      // First check if we have a session in Supabase
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("❌ Error checking session:", error)
        return false
      }

      const hasSession = !!data.session
      console.log(hasSession ? "✅ Valid session found" : "⚠️ No valid session found")
      return hasSession
    } catch (error) {
      console.error("❌ Exception checking session:", error)
      return false
    }
  }, [])

  // Define signOut function before it's used in checkInactivity
  const signOut = async () => {
    setIsLoading(true)

    try {
      console.log("👋 Signing out user...")

      // Get the Supabase client
      const supabase = getSupabaseClient()

      if (!supabase) {
        console.error("❌ Supabase client is undefined")
        // Still proceed with local cleanup
        setUser(null)
        setSession(null)
        cleanupAuthData()
        router.push("/auth/signin")
        return
      }

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
  }

  // Refresh session function that can be called from outside
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log("🔄 Checking if session can be refreshed...")

      // First check if we have a valid session before attempting to refresh
      const sessionValid = await hasValidSession()
      if (!sessionValid) {
        console.log("⚠️ No valid session to refresh, skipping refresh")
        return false
      }

      console.log("🔄 Valid session found, attempting to refresh...")
      const { success, session: refreshedSession, error } = await refreshAuthToken()

      if (!success || error) {
        console.error("❌ Error refreshing session:", error)

        // Check if this is a refresh token error
        if (error?.message?.includes("refresh_token_not_found") || (error as any)?.__isAuthError) {
          console.log("⚠️ Refresh token not found, signing out user")
          // Clean up auth data and redirect to sign in
          cleanupAuthData()
          setUser(null)
          setSession(null)

          // Save the current path for redirect after login
          if (typeof window !== "undefined" && pathname) {
            sessionStorage.setItem("redirectAfterLogin", pathname)
            sessionStorage.setItem("authRedirectReason", "Your session has expired. Please sign in again.")
          }

          router.push("/auth/signin")
        }

        return false
      }

      if (refreshedSession) {
        console.log("✅ Session refreshed successfully")

        // Update session state with new token and expiration
        const expiresAt = refreshedSession.expires_at
          ? new Date(refreshedSession.expires_at * 1000).getTime()
          : Date.now() + 8 * 60 * 60 * 1000

        setSession((prev) => {
          if (!prev) return null
          return {
            ...prev,
            token: refreshedSession.access_token,
            expiresAt: expiresAt,
          }
        })

        return true
      }

      return false
    } catch (error) {
      console.error("❌ Exception refreshing session:", error)

      // Handle any unexpected errors during refresh
      if ((error as any).__isAuthError) {
        console.log("⚠️ Auth error during refresh, signing out user")
        cleanupAuthData()
        setUser(null)
        setSession(null)

        // Save the current path for redirect after login
        if (typeof window !== "undefined" && pathname) {
          sessionStorage.setItem("redirectAfterLogin", pathname)
          sessionStorage.setItem("authRedirectReason", "Your session has expired. Please sign in again.")
        }

        router.push("/auth/signin")
      }

      return false
    }
  }, [hasValidSession, router, pathname])

  // Add this function to check for inactivity
  const checkInactivity = useCallback(() => {
    if (typeof window === "undefined" || !session) return

    const lastActiveTime = localStorage.getItem("lastActiveTime")
    if (!lastActiveTime) return

    const inactiveTime = Date.now() - Number.parseInt(lastActiveTime)
    const maxInactiveTime = 60 * 60 * 1000 // 1 hour of inactivity

    if (inactiveTime > maxInactiveTime) {
      console.log(`⚠️ User inactive for ${Math.floor(inactiveTime / 60000)} minutes, signing out`)

      // Save the current path for redirect after login
      if (pathname && pathname !== "/auth/signin") {
        sessionStorage.setItem("redirectAfterLogin", pathname)
        sessionStorage.setItem("authRedirectReason", "You were signed out due to inactivity. Please sign in again.")
      }

      signOut()
    }
  }, [session, pathname])

  // Add this effect to periodically check for inactivity
  useEffect(() => {
    if (!user) return

    // Update last active time when user interacts with the page
    const updateLastActiveTime = () => {
      if (typeof window !== "undefined") {
        localStorage.setItem("lastActiveTime", Date.now().toString())
      }
    }

    // Add event listeners for user activity
    window.addEventListener("mousemove", updateLastActiveTime)
    window.addEventListener("keydown", updateLastActiveTime)
    window.addEventListener("click", updateLastActiveTime)

    // Check inactivity periodically
    const interval = setInterval(checkInactivity, 5 * 60 * 1000) // Every 5 minutes

    return () => {
      window.removeEventListener("mousemove", updateLastActiveTime)
      window.removeEventListener("keydown", updateLastActiveTime)
      window.removeEventListener("click", updateLastActiveTime)
      clearInterval(interval)
    }
  }, [user, checkInactivity])

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus()

    // Set up Supabase auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, supabaseSession) => {
      console.log("🔔 Auth state changed:", event)

      if (event === "SIGNED_IN" && supabaseSession) {
        const profileSuccess = await fetchUserProfile(supabaseSession.user.id)
        // After successful sign in, store the last active time
        if (profileSuccess) {
          // Create session object with proper expiration
          const expiresAt = supabaseSession.expires_at
            ? new Date(supabaseSession.expires_at * 1000).getTime()
            : Date.now() + 8 * 60 * 60 * 1000 // Default to 8 hours

          const browser = navigator.userAgent
          const os = navigator.platform

          // Store last active time in localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("lastActiveTime", Date.now().toString())
          }

          const newSession: Session = {
            token: supabaseSession.access_token,
            expiresAt: expiresAt,
            userId: supabaseSession.user.id,
            deviceInfo: {
              browser,
              os,
              ip: "127.0.0.1", // In a real app, this would be the actual IP
              lastActive: new Date().toISOString(),
            },
          }

          setSession(newSession)
          console.log("✅ Session state updated successfully")

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
        }
      } else if (event === "SIGNED_OUT") {
        console.log("👋 User signed out")
        setUser(null)
        setSession(null)
      } else if (event === "TOKEN_REFRESHED") {
        console.log("🔄 Token refreshed")
        // Update session expiration time
        if (supabaseSession) {
          setSession((prev) => {
            if (!prev) return null
            return {
              ...prev,
              token: supabaseSession.access_token,
              expiresAt: supabaseSession.expires_at
                ? new Date(supabaseSession.expires_at * 1000).getTime()
                : Date.now() + 8 * 60 * 60 * 1000,
            }
          })
        }
      } else if (event === "USER_UPDATED") {
        console.log("👤 User updated, refreshing profile")
        if (supabaseSession) {
          await fetchUserProfile(supabaseSession.user.id)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, refreshSession])

  // Update the fetchUserProfile function to handle the case where user_profiles table doesn't exist
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("👤 Fetching user profile for:", userId)

      // First check if the user exists
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error("❌ Error fetching user:", userError)
        return false
      }

      if (!userData.user) {
        console.error("⚠️ No user found")
        return false
      }

      // Create a basic user profile from auth data
      const userProfile: User = {
        id: userId,
        name: userData.user.user_metadata?.full_name || "User",
        email: userData.user.email || "",
        role: "user",
        lastLogin: new Date().toISOString(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.user.user_metadata?.full_name || "User")}&background=random`,
      }

      setUser(userProfile)
      console.log("✅ User profile set successfully")
      return true
    } catch (error) {
      console.error("❌ Error in fetchUserProfile:", error)
      // Log the specific error for debugging
      if (error instanceof Error) {
        console.error("Error message:", error.message)
      }
      return false
    }
  }

  // Update the checkAuthStatus function to handle null Supabase client
  const checkAuthStatus = async () => {
    setIsLoading(true)
    // Declare timeoutId here
    let timeoutId: NodeJS.Timeout
    try {
      console.log("🔍 Checking auth status...")

      // Get the Supabase client
      const supabase = getSupabaseClient()

      if (!supabase) {
        console.error("❌ Supabase client is undefined")
        setAuthError(new Error("Supabase client initialization failed"))
        setIsLoading(false)
        setAuthChecked(true)
        return
      }

      // Check for existing Supabase session
      const {
        data: { session: supabaseSession },
        error: sessionError,
      } = await supabase.auth.getSession()

      // Clear the timeout since we got a response
      clearTimeout(timeoutId)

      if (sessionError) {
        console.error("❌ Error getting session:", sessionError)
        setUser(null)
        setSession(null)
        setIsLoading(false)
        setAuthChecked(true)
        setAuthError(sessionError)
        return
      }

      if (supabaseSession) {
        console.log("✅ Session found:", supabaseSession.user.id)

        // Debug session details
        debugSession(supabaseSession)

        // Use the improved checkSession function
        const sessionCheck = await checkSession()

        if (!sessionCheck.valid) {
          console.log(`⚠️ Session check failed: ${sessionCheck.reason}`)

          if (sessionCheck.reason === "Session expired" || sessionCheck.reason?.includes("Failed to refresh")) {
            console.log("🔄 Attempting to sign out and redirect to sign in")

            // Save the current path for redirect after login
            if (typeof window !== "undefined" && pathname && pathname !== "/auth/signin") {
              sessionStorage.setItem("redirectAfterLogin", pathname)
              sessionStorage.setItem("authRedirectReason", "Your session has expired. Please sign in again.")
            }

            await supabase.auth.signOut()
            cleanupAuthData()
            setUser(null)
            setSession(null)
            setIsLoading(false)
            setAuthChecked(true)
            router.push("/auth/signin")
            return
          }
        } else {
          console.log("✅ Session check passed")
          if (sessionCheck.refreshed) {
            console.log("🔄 Session was refreshed during check")
          }
        }

        const success = await fetchUserProfile(supabaseSession.user.id)
        if (!success) {
          console.log("⚠️ Failed to fetch user profile, signing out")
          // If profile fetch fails, sign out
          await supabase.auth.signOut()
          setUser(null)
          setSession(null)
        } else {
          // Create session object
          const expiresAt = supabaseSession.expires_at
            ? new Date(supabaseSession.expires_at * 1000).getTime()
            : Date.now() + 8 * 60 * 60 * 1000 // Default to 8 hours

          const browser = navigator.userAgent
          const os = navigator.platform

          const newSession: Session = {
            token: supabaseSession.access_token,
            expiresAt: expiresAt,
            userId: supabaseSession.user.id,
            deviceInfo: {
              browser,
              os,
              ip: "127.0.0.1", // In a real app, this would be the actual IP
              lastActive: new Date().toISOString(),
            },
          }

          setSession(newSession)
          console.log("✅ Session state updated successfully")

          // Don't automatically redirect to dashboard
          // This was causing the navigation issues
        }
      } else {
        console.log("⚠️ No session found")

        // Check if we were redirected here due to an expired session
        const redirectReason = typeof window !== "undefined" ? sessionStorage.getItem("authRedirectReason") : null

        // Only redirect to sign-in if on a protected route
        const isAuthPage = window.location.pathname.includes("/auth/")
        const isRootPage = window.location.pathname === "/"

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
      // On error, clear session to be safe
      setUser(null)
      setSession(null)
      setAuthError(error instanceof Error ? error : new Error("Unknown auth error"))
    } finally {
      setIsLoading(false)
      setAuthChecked(true)
      console.log("✅ Auth status check completed")
    }
  }

  // Check if session is expired
  const isSessionExpired = (session: Session | null): boolean => {
    if (!session) return true
    const isExpired = Date.now() > session.expiresAt
    if (isExpired) {
      console.log("⚠️ Session is expired")
    }
    return isExpired
  }

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate username format
  const isValidUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9._-]+$/
    return usernameRegex.test(username)
  }

  // Update the signIn function to handle username validation
  const signIn = async (email: string, password: string) => {
    console.log("🔑 Attempting sign in...")

    // Get the Supabase client
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("❌ Supabase client is undefined")
      return {
        success: false,
        message: "Authentication service unavailable. Please try again later.",
      }
    }

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
    if (!isValidUsername(username)) {
      return {
        success: false,
        message: "Username contains invalid characters. Use only letters, numbers, dots, underscores, or hyphens.",
      }
    }

    // Validate full email format
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

      // Sign in with Supabase - always use a short-lived session
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Set session duration to 8 hours (browser session)
          expiresIn: 8 * 60 * 60, // 8 hours in seconds
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

      // Fetch user profile
      const profileSuccess = await fetchUserProfile(data.user.id)
      if (!profileSuccess) {
        console.error("❌ Failed to fetch user profile after sign in")
        return {
          success: false,
          message: "Authentication successful but failed to load your profile. Please try again.",
        }
      }

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
