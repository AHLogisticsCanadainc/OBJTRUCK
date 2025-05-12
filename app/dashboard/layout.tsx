"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import { SessionExpiryWarning } from "@/components/session-expiry-warning"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, immediateTokenVerify } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [authTimeout, setAuthTimeout] = useState(false)

  // Function to manually retry auth check
  const retryAuth = async () => {
    console.log("🔄 Manually retrying auth check in dashboard layout...")
    setAuthTimeout(false)

    try {
      const verified = await immediateTokenVerify()
      if (!verified) {
        goToSignIn()
      }
    } catch (error) {
      console.error("Error during auth retry:", error)
      goToSignIn()
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
    if (isLoading) {
      const timeout = setTimeout(async () => {
        console.log("⚠️ Auth loading timed out after 10 seconds in dashboard layout")

        // Try immediate verification as a last resort
        try {
          const verified = await immediateTokenVerify()
          if (!verified) {
            setAuthTimeout(true)
          }
        } catch (error) {
          console.error("Error during immediate verification:", error)
          setAuthTimeout(true)
        }
      }, 10000)

      return () => clearTimeout(timeout)
    }
  }, [isLoading, immediateTokenVerify])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      console.log("User not authenticated in dashboard layout, redirecting to signin")

      // Save the current path for redirect after login
      if (typeof window !== "undefined") {
        sessionStorage.setItem("redirectAfterLogin", pathname || "")
      }

      router.push("/auth/signin")
    }
  }, [user, isLoading, router, pathname])

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
