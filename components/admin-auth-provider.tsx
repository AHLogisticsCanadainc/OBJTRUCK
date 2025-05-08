"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAdminByEmail, logAdminSignIn } from "@/lib/database"
import { createClient } from "@supabase/supabase-js"
// First, import the cleanupAuthData function at the top of the file:
import { cleanupAuthData } from "@/lib/auth-utils"

// Define the shape of our admin user object
interface AdminUser {
  id: string
  name: string
  email: string
  createdAt: string
}

// Define the shape of our admin auth context
interface AdminAuthContextType {
  admin: AdminUser | null
  isLoading: boolean
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean
    message?: string
  }>
  signOut: () => void
}

// Create the admin auth context
const AdminAuthContext = createContext<AdminAuthContextType>({
  admin: null,
  isLoading: true,
  signIn: async () => ({ success: false }),
  signOut: () => {},
})

// Hook to use the admin auth context
export const useAdminAuth = () => useContext(AdminAuthContext)

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing admin session on mount
  useEffect(() => {
    const checkAdminSession = async () => {
      setIsLoading(true)
      try {
        // Check if we have an admin session in localStorage
        const adminSession = localStorage.getItem("adminSession")
        if (adminSession) {
          const parsedSession = JSON.parse(adminSession)
          // Check if the session is still valid (not expired)
          if (parsedSession.expiresAt > Date.now()) {
            setAdmin(parsedSession.admin)
          } else {
            // Session expired, remove it
            localStorage.removeItem("adminSession")
            setAdmin(null)
          }
        } else {
          setAdmin(null)
        }
      } catch (error) {
        console.error("Error checking admin session:", error)
        setAdmin(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminSession()
  }, [])

  // Validate username format
  const isValidUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9._-]+$/
    return usernameRegex.test(username)
  }

  // Update the signIn function to handle username validation
  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
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

      // Check if the email domain is allowed
      if (!email.endsWith("@logisticcanada.ca")) {
        return {
          success: false,
          message: "Only @logisticcanada.ca email addresses are allowed",
        }
      }

      // First, check if the email exists in the admin_users table
      const { data: adminData, error: adminError } = await getAdminByEmail(email)

      if (adminError || !adminData) {
        // Log the unauthorized sign-in attempt
        await logAdminSignIn(email, "127.0.0.1") // In a real app, use the actual IP

        return {
          success: false,
          message: "Invalid username or password",
        }
      }

      // For admin authentication, we'll use a simplified approach
      // In a real app, you would validate the password against a hashed version
      // For this demo, we'll assume the admin exists in the admin_users table

      // Log the successful sign-in
      await logAdminSignIn(email, "127.0.0.1") // In a real app, use the actual IP

      // Create admin user object
      const adminUser: AdminUser = {
        id: adminData.id,
        name: adminData.name,
        email: adminData.email,
        createdAt: adminData.created_at,
      }

      // Store admin session in localStorage with expiration (8 hours)
      const expiresAt = Date.now() + 8 * 60 * 60 * 1000
      localStorage.setItem(
        "adminSession",
        JSON.stringify({
          admin: adminUser,
          expiresAt,
        }),
      )

      setAdmin(adminUser)
      return { success: true }
    } catch (error) {
      console.error("Admin sign in error:", error)
      return {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out admin
  // Then update the signOut function to use it:
  const signOut = () => {
    setIsLoading(true)

    try {
      // Log the admin sign out event if needed
      console.log("Admin signing out:", admin?.email)

      // Clear admin session from localStorage
      localStorage.removeItem("adminSession")

      // Clean up all auth-related data
      cleanupAuthData()

      // Clear state
      setAdmin(null)

      // Use a small timeout to ensure state updates have propagated
      setTimeout(() => {
        router.push("/admin/login")
      }, 100)
    } catch (error) {
      console.error("Error during admin sign out process:", error)
      // Force redirect to login page even if there's an error
      router.push("/admin/login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}
