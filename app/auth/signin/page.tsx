"use client"

import type React from "react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { UsernameInput } from "@/components/username-input"
import { PasswordInput } from "@/components/password-input"
import { ThemeToggle } from "@/components/theme-toggle"
import Head from "next/head"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const emailDomain = "@logisticcanada.ca"
  const usernameInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null)
  const [redirectPath, setRedirectPath] = useState<string | null>(null)
  const router = useRouter()

  const { signIn } = useAuth()

  // Focus the username input on page load
  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    // Check if we have a redirect reason stored
    const reason = sessionStorage.getItem("authRedirectReason")
    if (reason) {
      setRedirectMessage(reason)
      // Clear it after reading
      sessionStorage.removeItem("authRedirectReason")
    }

    // Check if we have a redirect path stored
    const path = sessionStorage.getItem("redirectAfterLogin")
    if (path) {
      console.log("📍 Found redirect path:", path)
      setRedirectPath(path)
      // Don't clear it yet - we'll clear it after successful login
    }
  }, [])

  const validateForm = (): string | null => {
    if (!username.trim()) {
      return "Username is required"
    }

    if (!password) {
      return "Password is required"
    }

    // Check for invalid characters in username
    const usernameRegex = /^[a-zA-Z0-9._-]+$/
    if (!usernameRegex.test(username)) {
      return "Username contains invalid characters. Use only letters, numbers, dots, underscores, or hyphens."
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    // Construct the full email address
    const email = username.trim() + emailDomain

    setIsLoading(true)

    try {
      const result = await signIn(email, password)
      if (!result.success) {
        setError(result.message || "Invalid username or password")
      } else {
        // Login successful, handle redirect
        console.log("✅ Login successful, handling redirect")

        // Check if we need to redirect to a specific page after login
        if (redirectPath) {
          console.log("🔄 Redirecting to:", redirectPath)
          // Clear the redirect path from session storage
          sessionStorage.removeItem("redirectAfterLogin")
          // Navigate to the saved path
          router.push(redirectPath)
        } else {
          // Default redirect to dashboard
          console.log("🔄 No redirect path found, going to dashboard")
          router.push("/dashboard")
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        {/* Add meta tag to disable browser extensions */}
        <meta http-equiv="Content-Security-Policy" content="extension-script='none'" />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md px-4">
          <div className="flex flex-col items-center mb-8">
            {/* Company logo */}
            <div className="relative w-32 h-32 mb-6">
              <Image src="/images/ah-logo.png" alt="A.H Logistics Logo" fill className="object-contain" priority />
            </div>
            <h1 className="text-2xl font-medium text-neutral-900">Welcome to A.H Logistics</h1>
            <p className="text-neutral-500 mt-2">Sign in to access your TMS account</p>

            {/* Show redirect destination if available */}
            {redirectPath && (
              <div className="mt-2 text-sm text-blue-600">
                You'll be redirected to your requested page after signing in.
              </div>
            )}
          </div>

          <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white">
            <div className="p-8">
              <form onSubmit={handleSubmit} aria-label="Sign in form" className="space-y-6">
                {redirectMessage && (
                  <Alert variant="warning" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Session Expired</AlertTitle>
                    <AlertDescription>{redirectMessage}</AlertDescription>
                  </Alert>
                )}
                {error && (
                  <Alert variant="destructive" className="text-sm rounded-xl" aria-live="assertive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-5">
                  <UsernameInput
                    id="username"
                    ref={usernameInputRef}
                    value={username}
                    onChange={setUsername}
                    disabled={isLoading}
                    required
                    placeholder="username"
                    domain={emailDomain}
                    helperText="Enter your username without the domain"
                    className="rounded-xl border-neutral-200 focus-visible:ring-[#ed1c23]"
                    autoComplete="username"
                  />

                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={setPassword}
                    disabled={isLoading}
                    required
                    className="rounded-xl border-neutral-200 focus-visible:ring-[#ed1c23]"
                    autoComplete="current-password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-[#ed1c23] hover:bg-[#d01920] text-white font-medium transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </div>
          </Card>

          <p className="text-center text-xs text-neutral-400 mt-8">
            &copy; {new Date().getFullYear()} A.H Logistics Canada Inc. All rights reserved.
          </p>
        </div>
      </div>
    </>
  )
}
