"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import { SessionExpiryWarning } from "@/components/session-expiry-warning" // Import the component

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, session, refreshSession, resetAuthState, immediateTokenVerify } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isSessionValid, setIsSessionValid] = useState(true)
  const [authTimeout, setAuthTimeout] = useState(false)
  const redirectInProgress = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update the retryAuth function to be more effective
  const retryAuth = async () => {
    console.log("🔄 Manually retrying auth check in dashboard layout...")
    setAuthTimeout(false)

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Try immediate verification first
    try {
      const verified = await immediateTokenVerify()

      if (verified) {
        console.log("✅ Manual retry succeeded with immediate verification")
        // The auth state has been updated by immediateTokenVerify
      } else {
        // If immediate verification fails, try resetting auth state
        console.log("⚠️ Immediate verification failed during manual retry, resetting auth state")
        resetAuthState()
      }
    } catch (error) {
      console.error("❌ Error during manual retry:", error)
      resetAuthState()
    }
  }

  // Function to navigate to sign in page
  const goToSignIn = () => {
    console.log("🔄 Manually navigating to sign in page from dashboard...")
    // Save the current path for redirect after login
    if (typeof window !== "undefined" && pathname) {
      sessionStorage.setItem("redirectAfterLogin", pathname)
    }
    router.push("/auth/signin")
  }

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading && !authTimeout) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(async () => {
        console.log("⚠️ Auth loading timed out after 20 seconds in dashboard layout")

        // Try immediate verification as a last resort
        const verified = await immediateTokenVerify()

        if (!verified) {
          console.log("❌ Immediate verification failed after timeout")
          setAuthTimeout(true)
        } else {
          console.log("✅ Immediate verification succeeded after timeout")
          // No need to set authTimeout since verification succeeded
        }
      }, 20000) // Increased from 15 seconds to 20 seconds
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isLoading, authTimeout, immediateTokenVerify])

  // Also modify the session check to avoid redirects during quotes page navigation
  useEffect(() => {
    if (!isLoading && !user && !redirectInProgress.current) {
      console.log("User not authenticated in dashboard layout, redirecting to signin")
      redirectInProgress.current = true

      // Immediately set a flag in sessionStorage to prevent infinite redirects
      if (typeof window !== "undefined") {
        // Save the current path for redirect after login
        sessionStorage.setItem("redirectAfterLogin", pathname)
        // Set a flag to indicate we're already redirecting
        sessionStorage.setItem("redirectInProgress", "true")
      }

      // Use a small timeout to ensure the redirect happens
      setTimeout(() => {
        router.push("/auth/signin")
      }, 50)
    }
  }, [user, isLoading, router, pathname])

  // Reset redirect flag when pathname changes
  useEffect(() => {
    redirectInProgress.current = false
  }, [pathname])

  // Add periodic session check
  useEffect(() => {
    if (!user) return

    // Check if session is about to expire
    const checkSession = () => {
      if (!session) return

      const now = Date.now()
      const expiresAt = session.expiresAt
      const timeUntilExpiry = expiresAt - now

      // If session expires in less than 30 minutes, refresh it
      if (timeUntilExpiry < 30 * 60 * 1000) {
        console.log(`Session expiring soon (in ${Math.floor(timeUntilExpiry / 60000)} minutes), refreshing...`)
        refreshSession().catch((error) => {
          console.error("Failed to refresh session:", error)

          // Show a notification to the user that their session will expire soon
          if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) {
            // Only show for sessions expiring in less than 5 minutes
            // You could add a toast notification here
            console.log("⚠️ Session expiring very soon, notifying user")
          }

          setIsSessionValid(false)
        })
      }
    }

    // Check immediately
    checkSession()

    // Then check periodically - more frequently to catch expiration
    const interval = setInterval(checkSession, 5 * 60 * 1000) // Every 5 minutes

    return () => clearInterval(interval)
  }, [user, session, refreshSession, pathname])

  // Handle invalid session
  useEffect(() => {
    if (!isSessionValid && !isLoading && !redirectInProgress.current) {
      console.log("Session invalid, redirecting to signin")
      redirectInProgress.current = true
      // Save the current path for redirect after login
      if (typeof window !== "undefined") {
        sessionStorage.setItem("redirectAfterLogin", pathname)
        sessionStorage.setItem("authRedirectReason", "Your session has expired. Please sign in again.")
      }
      router.push("/auth/signin")
    }
  }, [isSessionValid, isLoading, router, pathname])

  // Clean up redirect flag when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("redirectInProgress")
      }
    }
  }, [])

  // Update the useEffect that handles loading timeout to be more robust

  // Add a new useEffect to handle loading timeout
  useEffect(() => {
    // If we're stuck in loading state for more than 10 seconds, try immediate verification
    if (isLoading && !authTimeout) {
      let loadingTimeout: NodeJS.Timeout
      loadingTimeout = setTimeout(async () => {
        console.log("⚠️ Dashboard auth loading taking too long, attempting immediate verification...")
        try {
          const verified = await immediateTokenVerify()

          if (verified) {
            console.log("✅ Dashboard immediate verification succeeded")
            // No need to do anything else, the auth state has been updated
          } else {
            console.log("❌ Dashboard immediate verification failed")

            // Check if we should redirect or show timeout UI
            if (typeof window !== "undefined") {
              const hasToken = localStorage.getItem("sb-access-token")

              if (!hasToken) {
                // No token, redirect to sign in
                console.log("❌ No token found, redirecting to sign in")
                sessionStorage.setItem("redirectAfterLogin", pathname || "")
                sessionStorage.setItem("authRedirectReason", "Your session has expired. Please sign in again.")
                router.push("/auth/signin")
              } else {
                // Has token but verification failed, show timeout UI
                setAuthTimeout(true)
              }
            } else {
              setAuthTimeout(true)
            }
          }
        } catch (error) {
          console.error("❌ Error during immediate verification:", error)
          setAuthTimeout(true)
        }
      }, 10000) // 10 seconds

      return () => clearTimeout(loadingTimeout)
    }
  }, [isLoading, authTimeout, immediateTokenVerify, router, pathname])

  // Show timeout error with improved UI
  if (authTimeout) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg border border-border">
          <div className="flex items-center gap-3 mb-4 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Dashboard Access Error</h2>
          </div>

          <p className="mb-4 text-muted-foreground">
            We couldn't load your dashboard due to an authentication issue. This may be because:
          </p>

          <ul className="list-disc pl-5 mb-6 space-y-1 text-sm text-muted-foreground">
            <li>Your session has expired after a period of inactivity</li>
            <li>There was a problem connecting to the authentication service</li>
            <li>Your account permissions have changed</li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={retryAuth} className="flex items-center gap-2 w-full sm:w-auto">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            <Button variant="default" onClick={goToSignIn} className="w-full sm:w-auto">
              Sign In Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-sm text-muted-foreground">Verifying your session...</p>
        <p className="mt-1 text-xs text-muted-foreground">This should only take a few seconds</p>
      </div>
    )
  }

  // Don't render anything if not authenticated - the effect will handle redirection
  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoadingSpinner size="md" text="Redirecting to login..." />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - hidden on mobile */}
      <DashboardSidebar />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-background">
        {/* Page content - no top bar, content starts at the top */}
        <div className="relative h-full">
          {children}

          {/* Add the SessionExpiryWarning component */}
          <SessionExpiryWarning warningThresholdMinutes={10} />
        </div>
      </main>
    </div>
  )
}
