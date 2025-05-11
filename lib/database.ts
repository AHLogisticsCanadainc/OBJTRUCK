import { createClient } from "@supabase/supabase-js"
import { getAccessToken, getRefreshToken } from "@/lib/token-service"

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a singleton instance for the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

// Function to get the Supabase client (singleton pattern)
export function getSupabaseClient() {
  if (!supabaseInstance && supabaseUrl && supabaseAnonKey) {
    try {
      // Enhanced client options with better error handling
      const clientOptions = {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: "supabase.auth.token",
          storage: {
            getItem: (key: string) => {
              try {
                // Use our token service for auth-related keys
                if (key.includes("access_token")) {
                  return getAccessToken()
                }
                if (key.includes("refresh_token")) {
                  return getRefreshToken()
                }
                // Fall back to localStorage for other keys
                return localStorage.getItem(key)
              } catch (error) {
                console.error(`Error retrieving key ${key}:`, error)
                return null
              }
            },
            setItem: (key: string, value: string) => {
              try {
                localStorage.setItem(key, value)
              } catch (error) {
                console.error(`Error setting key ${key}:`, error)
              }
            },
            removeItem: (key: string) => {
              try {
                localStorage.removeItem(key)
              } catch (error) {
                console.error(`Error removing key ${key}:`, error)
              }
            },
          },
        },
      }

      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, clientOptions)
      console.log("Supabase client initialized with URL:", supabaseUrl ? "URL provided" : "URL missing")
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error)
      return null
    }
  } else if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing required Supabase environment variables")
    return null
  }

  return supabaseInstance
}

// Create the client
export const supabase = getSupabaseClient()

// Initialize admin client for server-side operations that need to bypass RLS
// Only create this on the server side
export const supabaseAdmin =
  typeof window === "undefined" && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null

// Function to get admin user by email
export async function getAdminByEmail(email: string) {
  const client = getSupabaseClient()
  if (!client) {
    return { data: null, error: new Error("Supabase client not initialized") }
  }

  try {
    const { data, error } = await client.from("admin_users").select("*").eq("email", email).single()

    if (error) {
      console.error("Error fetching admin user:", error)
      return { data: null, error }
    }
    return { data, error: null }
  } catch (error) {
    console.error("Exception fetching admin user:", error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error fetching admin user"),
    }
  }
}

// Function to log admin sign-in
export async function logAdminSignIn(email: string, ipAddress: string) {
  if (!supabaseAdmin) {
    console.error("Admin client not initialized")
    return { data: null, error: new Error("Admin client not initialized") }
  }

  try {
    const { data, error } = await supabaseAdmin.rpc("log_admin_signin", {
      p_email: email,
      p_ip: ipAddress,
    })

    if (error) {
      console.error("Error logging admin sign-in:", error)
      return { data: null, error }
    }
    return { data, error: null }
  } catch (error) {
    console.error("Exception logging admin sign-in:", error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error logging admin sign-in"),
    }
  }
}

export async function testSupabaseConnection() {
  const client = getSupabaseClient()
  if (!client) {
    return {
      success: false,
      message: "Could not initialize Supabase client. Check your environment variables.",
    }
  }

  try {
    // Simple query to test connection - use customers table instead of clients
    const { data, error } = await client.from("customers").select("id").limit(1).maybeSingle()

    if (error) {
      console.error("Database connection test failed:", error)
      return {
        success: false,
        message: `Database connection test failed: ${error.message}`,
      }
    }

    return { success: true, message: "Database connection successful" }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown database connection error",
    }
  }
}

// Database tables
export const TABLES = {
  USERS: "users",
  USER_PROFILES: "user_profiles",
  CARRIERS: "carriers",
  LOADS: "loads",
  CUSTOMERS: "customers",
  DOCUMENTS: "documents",
  ADMIN_USERS: "admin_users",
  ADMIN_SIGNINS: "admin_signins",
  UNAUTHORIZED_SIGNINS: "unauthorized_signins",
}
