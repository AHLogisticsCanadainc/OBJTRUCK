"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "./auth-provider"
import { LoadingSpinner } from "./loading-spinner"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, immediateTokenVerify } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [authTimeout, setAuthTimeout] = useState(false)

  // Function to manually retry auth check
  const retryAuthCheck = async () => {
    console.log("🔄 Manually retrying auth check...")
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
    console.log("🔄 Manually navigating to sign in page...")
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
        console.log("⚠️ Auth check timed out after 10 seconds")

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
    // Skip auth check for public routes
    if (
      pathname === "/" ||
      pathname === "/auth/signin" ||
      pathname === "/auth/signup" ||
      pathname === "/auth/forgot-password" ||
      pathname.startsWith("/admin/login")
    ) {
      return
    }

    if (!isLoading && !user) {
      console.log("User not authenticated, redirecting to signin")

      // Save the current path for redirect after login
      if (typeof window !== "undefined") {
        sessionStorage.setItem("redirectAfterLogin", pathname || "")
      }

      router.push("/auth/signin")
    }
  }, [user, isLoading, router, pathname])

  // Show timeout error message with better UI and clearer instructions
  if (authTimeout) {
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
  if (isLoading) {
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
