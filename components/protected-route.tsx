"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "./auth-provider"
import { LoadingSpinner } from "./loading-spinner"
import { handleAuthError } from "@/lib/auth-error-handler"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Update the destructuring of useAuth to include immediateTokenVerify
  const { user, isLoading, session, refreshSession, immediateTokenVerify } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authCheckAttempts, setAuthCheckAttempts] = useState(0)
  const [authCheckTimeout, setAuthCheckTimeout] = useState(false)
  const redirectInProgress = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Function to manually retry auth check
  const retryAuthCheck = () => {
    console.log("🔄 Manually retrying auth check...")
    setAuthCheckTimeout(false)
    setAuthCheckAttempts(0)
    setIsCheckingAuth(true)

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  // Function to navigate to sign in page
  const goToSignIn = () => {
    console.log("🔄 Manually navigating to sign in page...")
    // Save the current path for redirect after login
    if (typeof window !== "undefined" && pathname) {
      sessionStorage.setItem("redirectAfterLogin", pathname)
    }
    router.push("/auth/signin")
  }

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    if (isCheckingAuth && !authCheckTimeout) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        console.log("⚠️ Auth check timed out after 20 seconds")
        setAuthCheckTimeout(true)
        setIsCheckingAuth(false)
      }, 20000) // Increased from 5 seconds to 20 seconds
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isCheckingAuth, authCheckTimeout])

  // Add a new useEffect to handle loading timeout
  useEffect(() => {
    // If we're stuck in loading state for more than 10 seconds, try immediate verification
    if (isLoading) {
      const loadingTimeout = setTimeout(async () => {
        console.log("⚠️ Auth loading taking too long, attempting immediate verification...")
        const verified = await immediateTokenVerify()

        if (!verified) {
          console.log("❌ Immediate verification failed, redirecting to sign in")
          // Save the current path for redirect after login
          if (typeof window !== "undefined" && pathname) {
            sessionStorage.setItem("redirectAfterLogin", pathname)
            sessionStorage.setItem("authRedirectReason", "Authentication verification timed out. Please sign in again.")
          }
          router.push("/auth/signin")
        } else {
          console.log("✅ Immediate verification succeeded")
        }
      }, 10000) // Increased from 3 seconds to 10 seconds

      return () => clearTimeout(loadingTimeout)
    }
  }, [isLoading, immediateTokenVerify, router, pathname])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log(`🔍 Checking auth for route: ${pathname} (attempt ${authCheckAttempts + 1})`)

        // Skip auth check for public routes
        if (
          pathname === "/" ||
          pathname === "/auth/signin" ||
          pathname === "/auth/signup" ||
          pathname === "/auth/forgot-password" ||
          pathname.startsWith("/admin/login")
        ) {
          console.log("✅ Public route, skipping auth check")
          setIsCheckingAuth(false)
          return
        }

        // If we're still loading auth state, wait but don't increment attempts
        if (isLoading) {
          console.log("⏳ Auth state is still loading, waiting...")
          // Don't set isCheckingAuth to false here, we're still checking
          return
        }

        // If user is authenticated, we're good
        if (user && session) {
          console.log("✅ User is authenticated")

          // Debug session details
          console.log("📊 Session Debug Info:")
          console.log(`  • User ID: ${user.id || "Unknown"}`)
          console.log(`  • Expires: ${session.expiresAt ? new Date(session.expiresAt).toISOString() : "Unknown"}`)

          const timeUntilExpiry = session.expiresAt ? Math.floor((session.expiresAt - Date.now()) / 60000) : 0
          console.log(`  • Expires in: ${timeUntilExpiry} minutes`)

          // Check if session is about to expire and refresh if needed
          if (session.expiresAt && session.expiresAt - Date.now() < 30 * 60 * 1000) {
            try {
              console.log("🔄 Session expiring soon, refreshing...")
              await refreshSession()
              console.log("✅ Session refreshed successfully")
            } catch (refreshError) {
              console.error("❌ Error refreshing session:", refreshError)

              // Handle auth errors gracefully
              if (
                handleAuthError(refreshError, () => {
                  console.log("🔄 Redirecting to sign in due to refresh error")
                })
              ) {
                // If this is an auth error, redirect to sign in with a message
                if (!redirectInProgress.current) {
                  redirectInProgress.current = true
                  // Store a message to display on the sign-in page
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem("authRedirectReason", "Your session expired. Please sign in again.")
                    // Save the current path for redirect after login
                    sessionStorage.setItem("redirectAfterLogin", pathname)
                  }
                  router.push("/auth/signin")
                  return
                }
              }
            }
          }

          setIsCheckingAuth(false)
          return
        }

        // If we've reached the maximum number of attempts, redirect
        if (authCheckAttempts >= 2) {
          // Reduced from 3 to 2 for faster feedback
          console.log("⚠️ Maximum auth check attempts reached, redirecting")

          // Prevent further checks
          setIsCheckingAuth(false)

          if (!redirectInProgress.current) {
            redirectInProgress.current = true

            // If we're on an admin route, redirect to admin login
            if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
              // Save the current path for redirect after login
              if (typeof window !== "undefined") {
                sessionStorage.setItem("redirectAfterLogin", pathname)
              }
              router.push("/admin/login")
              return
            }

            // For all other protected routes, redirect to signin
            if (!pathname.startsWith("/auth/")) {
              console.log("🔄 User not authenticated, redirecting to signin")
              // Save the current path for redirect after login
              if (typeof window !== "undefined") {
                sessionStorage.setItem("redirectAfterLogin", pathname)
              }
              router.push("/auth/signin")
              return
            }
          }
          return // Important: stop further execution after max attempts
        }

        // Increment the auth check attempts
        setAuthCheckAttempts((prev) => prev + 1)

        // If user is not authenticated and we're not on an auth page, redirect
        if (!user && !pathname.startsWith("/auth/") && !redirectInProgress.current) {
          console.log("🔄 User not authenticated, redirecting to signin")
          redirectInProgress.current = true
          // Save the current path for redirect after login
          if (typeof window !== "undefined") {
            sessionStorage.setItem("redirectAfterLogin", pathname)
          }
          router.push("/auth/signin")
          return
        }

        setIsCheckingAuth(false)
      } catch (error) {
        console.error("❌ Error in auth check:", error)

        // Handle auth errors gracefully
        handleAuthError(error, () => {
          console.log("🔄 Redirecting to sign in due to auth error")
          // Save the current path for redirect after login
          if (typeof window !== "undefined" && pathname) {
            sessionStorage.setItem("redirectAfterLogin", pathname)
          }
        })

        setIsCheckingAuth(false)
      }
    }

    if (!authCheckTimeout) {
      checkAuth()
    }
  }, [user, isLoading, pathname, router, session, refreshSession, authCheckAttempts, authCheckTimeout])

  // Reset redirect flag when pathname changes
  useEffect(() => {
    redirectInProgress.current = false
  }, [pathname])

  // Show timeout error message with better UI and clearer instructions
  if (authCheckTimeout) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg border border-border">
          <div className="flex items-center gap-3 mb-4 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Session Expired</h2>
          </div>

          <p className="mb-4 text-muted-foreground">
            Your session has expired or you're not authenticated. This can happen when:
          </p>

          <ul className="list-disc pl-5 mb-6 space-y-1 text-sm text-muted-foreground">
            <li>You haven't used the system for an extended period</li>
            <li>Your authentication token has expired</li>
            <li>There was a problem with the authentication service</li>
            <li>You've been logged out from another device</li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={retryAuthCheck} className="flex items-center gap-2 w-full sm:w-auto">
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </Button>
            <Button variant="default" onClick={goToSignIn} className="w-full sm:w-auto">
              Sign In Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show loading spinner while checking auth
  if (isCheckingAuth || isLoading) {
    // Don't show loading spinner for public routes
    if (
      pathname === "/" ||
      pathname === "/auth/signin" ||
      pathname === "/auth/signup" ||
      pathname === "/auth/forgot-password"
    ) {
      return <>{children}</>
    }

    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-sm text-gray-500">Verifying authentication...</p>
        <p className="mt-1 text-xs text-gray-400">This should only take a few seconds</p>
      </div>
    )
  }

  // For public routes or authenticated users, render children
  return <>{children}</>
}
