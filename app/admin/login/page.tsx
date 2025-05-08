"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/components/admin-auth-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, ShieldAlert } from "lucide-react"
import { UsernameInput } from "@/components/username-input"
import { PasswordInput } from "@/components/password-input"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { admin, signIn, isLoading: authLoading } = useAdminAuth()
  const router = useRouter()
  const emailDomain = "@logisticcanada.ca"
  const usernameInputRef = useRef<HTMLInputElement>(null)

  // If admin is already logged in, redirect to admin dashboard
  useEffect(() => {
    if (admin && !authLoading) {
      router.push("/admin/dashboard")
    }
  }, [admin, authLoading, router])

  // Focus the username input on page load
  useEffect(() => {
    if (usernameInputRef.current && !admin) {
      usernameInputRef.current.focus()
    }
  }, [admin])

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
        // Redirect to admin dashboard on successful login
        router.push("/admin/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <Loader2 className="h-12 w-12 animate-spin text-[#ed1c23]" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md px-4">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32 mb-6">
            <Image src="/images/ah-logo.png" alt="A.H Logistics Logo" fill className="object-contain" priority />
            <div className="absolute -bottom-1 -right-1 bg-neutral-900 rounded-full p-1.5">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-medium text-neutral-900">Admin Portal</h1>
          <p className="text-neutral-500 mt-2">Sign in to access the admin dashboard</p>
        </div>

        <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white">
          <div className="p-8">
            <form onSubmit={handleSubmit} aria-label="Admin sign in form" className="space-y-6">
              {error && (
                <Alert variant="destructive" className="text-sm rounded-xl" aria-live="assertive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-5">
                <UsernameInput
                  id="admin-username"
                  ref={usernameInputRef}
                  value={username}
                  onChange={setUsername}
                  disabled={isLoading}
                  required
                  label="Admin Username"
                  placeholder="admin"
                  domain={emailDomain}
                  helperText="Enter your admin username without the domain"
                  className="rounded-xl border-neutral-200 focus-visible:ring-[#ed1c23]"
                />

                <PasswordInput
                  id="admin-password"
                  value={password}
                  onChange={setPassword}
                  disabled={isLoading}
                  required
                  className="rounded-xl border-neutral-200 focus-visible:ring-[#ed1c23]"
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
  )
}
