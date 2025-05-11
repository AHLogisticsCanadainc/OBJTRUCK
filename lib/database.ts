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

// Database queries for user profiles
export async function getUserProfile(userId) {
  const { data, error } = await supabase.from(TABLES.USER_PROFILES).select("*").eq("id", userId).single()

  return { data, error }
}

export async function updateUserProfile(userId, profileData) {
  const { data, error } = await supabase.from(TABLES.USER_PROFILES).update(profileData).eq("id", userId)

  return { data, error }
}

// Carrier functions
export async function getCarriers() {
  const { data, error } = await supabase.from(TABLES.CARRIERS).select("*").order("name")

  return { data, error }
}

export async function getCarrier(carrierId) {
  const { data, error } = await supabase.from(TABLES.CARRIERS).select("*").eq("id", carrierId).single()

  return { data, error }
}

export async function addCarrier(carrierData) {
  const { data, error } = await supabase.from(TABLES.CARRIERS).insert(carrierData)

  return { data, error }
}

export async function updateCarrier(carrierId, carrierData) {
  const { data, error } = await supabase.from(TABLES.CARRIERS).update(carrierData).eq("id", carrierId)

  return { data, error }
}

// Load functions
export async function getLoads(filters = {}) {
  let query = supabase.from(TABLES.LOADS).select("*, carriers(*), customers(*)")

  // Apply any filters
  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  if (filters.startDate) {
    query = query.gte("pickup_date", filters.startDate)
  }

  if (filters.endDate) {
    query = query.lte("delivery_date", filters.endDate)
  }

  if (filters.carrierId) {
    query = query.eq("carrier_id", filters.carrierId)
  }

  if (filters.customerId) {
    query = query.eq("customer_id", filters.customerId)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  return { data, error }
}

export async function getLoad(loadId) {
  const { data, error } = await supabase
    .from(TABLES.LOADS)
    .select("*, carriers(*), customers(*)")
    .eq("id", loadId)
    .single()

  return { data, error }
}

export async function addLoad(loadData) {
  const { data, error } = await supabase.from(TABLES.LOADS).insert(loadData)

  return { data, error }
}

export async function updateLoad(loadId, loadData) {
  const { data, error } = await supabase.from(TABLES.LOADS).update(loadData).eq("id", loadId)

  return { data, error }
}

// Customer functions
export async function getCustomers() {
  const { data, error } = await supabase.from(TABLES.CUSTOMERS).select("*").order("name")

  return { data, error }
}

export async function getCustomer(customerId) {
  const { data, error } = await supabase.from(TABLES.CUSTOMERS).select("*").eq("id", customerId).single()

  return { data, error }
}

export async function addCustomer(customerData) {
  const { data, error } = await supabase.from(TABLES.CUSTOMERS).insert(customerData)

  return { data, error }
}

export async function updateCustomer(customerId, customerData) {
  const { data, error } = await supabase.from(TABLES.CUSTOMERS).update(customerData).eq("id", customerId)

  return { data, error }
}

// Document functions
export async function getDocuments(loadId) {
  const { data, error } = await supabase.from(TABLES.DOCUMENTS).select("*").eq("load_id", loadId)

  return { data, error }
}

export async function addDocument(documentData) {
  const { data, error } = await supabase.from(TABLES.DOCUMENTS).insert(documentData)

  return { data, error }
}

// Admin authentication functions
export async function getAdminByEmail(email) {
  const { data, error } = await supabase.from(TABLES.ADMIN_USERS).select("*").eq("email", email).single()

  if (error && error.code === "PGRST116") {
    console.error("Admin user not found:", email)
    return { data: null, error: null }
  }

  return { data, error }
}

export async function logAdminSignIn(email, ipAddress) {
  try {
    // First check if the admin exists
    const { data: adminData } = await getAdminByEmail(email)

    if (adminData) {
      // Log successful sign-in
      const { data, error } = await supabase.from(TABLES.ADMIN_SIGNINS).insert({
        admin_id: adminData.id,
        ip_address: ipAddress,
      })
      return { data, error }
    } else {
      // Log unauthorized sign-in attempt
      const { data, error } = await supabase.from(TABLES.UNAUTHORIZED_SIGNINS).insert({
        email,
        ip_address: ipAddress,
      })
      return { data, error }
    }
  } catch (error) {
    console.error("Error logging admin sign-in:", error)
    return { data: null, error }
  }
}

export async function getAdminSignIns(adminId) {
  const { data, error } = await supabase
    .from(TABLES.ADMIN_SIGNINS)
    .select("*")
    .eq("admin_id", adminId)
    .order("signed_in_at", { ascending: false })

  return { data, error }
}

export async function getUnauthorizedSignIns() {
  const { data, error } = await supabase
    .from(TABLES.UNAUTHORIZED_SIGNINS)
    .select("*")
    .order("attempted_at", { ascending: false })

  return { data, error }
}

// Server-side function to get a user's session
export async function getServerSession(cookieStore) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error("Error getting server session:", error)
    return { session: null, error }
  }

  return { session: data.session, error: null }
}

// Add this function to check environment variables
export function checkEnvironmentVariables() {
  // Required variables - these must be present for basic functionality
  const requiredVariables = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  // Optional variables - these are only needed for specific features
  // Only check server-side variables on the server
  const optionalVariables =
    typeof window === "undefined"
      ? {
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
          RESEND_API_KEY: process.env.RESEND_API_KEY,
        }
      : {}

  // Check required variables
  const missingRequired = Object.entries(requiredVariables)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingRequired.length > 0) {
    console.error("Missing required environment variables:", missingRequired)
    return false
  }

  // Check optional variables (just log a warning, don't return false)
  const missingOptional = Object.entries(optionalVariables)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingOptional.length > 0) {
    console.warn("Some optional environment variables are not set:", missingOptional)
    console.warn("This may limit certain features but won't prevent the application from running.")
  }

  console.log("All required environment variables are set")
  return true
}

// Call the function immediately
checkEnvironmentVariables()

// Function to check if a reference exists and get the next available reference
export async function getNextAvailableReference(yearPrefix = `Q-${new Date().getFullYear()}-`) {
  try {
    // Query to find all references for the specified year prefix
    const { data, error } = await supabase
      .from("quotes")
      .select("reference")
      .like("reference", `${yearPrefix}%`)
      .order("reference", { ascending: false })

    if (error) {
      console.error("Error fetching existing references:", error)
      throw new Error(`Failed to check existing references: ${error.message}`)
    }

    // Find the highest sequence number
    let maxSequence = 0
    if (data && data.length > 0) {
      for (const quote of data) {
        if (!quote.reference) continue

        // Extract the sequence number from the reference
        const match = quote.reference.match(new RegExp(`${yearPrefix}(\\d+)`))
        if (match && match[1]) {
          const sequence = Number.parseInt(match[1], 10)
          if (!isNaN(sequence) && sequence > maxSequence) {
            maxSequence = sequence
          }
        }
      }
    }

    // Generate the new reference with the next sequence number
    const nextSequence = maxSequence + 1
    const paddedSequence = nextSequence.toString().padStart(3, "0")
    const newReference = `${yearPrefix}${paddedSequence}`

    return {
      reference: newReference,
      sequence: nextSequence,
      exists: false,
    }
  } catch (err) {
    console.error("Error generating next available reference:", err)
    // Fallback to a timestamp-based reference if there's an error
    const timestamp = Date.now().toString().slice(-6)
    return {
      reference: `${yearPrefix}ERR${timestamp}`,
      sequence: -1,
      exists: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}

// Function to check if a specific reference already exists
export async function checkReferenceExists(reference: string) {
  try {
    const { data, error } = await supabase.from("quotes").select("id").eq("reference", reference).maybeSingle()

    if (error) {
      console.error("Error checking reference existence:", error)
      throw new Error(`Failed to check reference: ${error.message}`)
    }

    return {
      exists: !!data,
      id: data?.id,
    }
  } catch (err) {
    console.error("Error checking if reference exists:", err)
    return {
      exists: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}

// Add this function to help fix reference issues

/**
 * Fix reference issues by reassigning sequential references to quotes without proper references
 * This should be used with caution and typically only in admin contexts
 */
export async function fixReferenceIssues(year?: number) {
  const currentYear = year || new Date().getFullYear()
  const yearPrefix = `Q-${currentYear}-`

  try {
    console.log(`Fixing reference issues for year: ${currentYear}`)

    // First, get all quotes for the year that have null, empty, or invalid references
    const { data: invalidRefs, error: invalidError } = await supabase
      .from("quotes")
      .select("id, reference, created_at")
      .or(`reference.is.null,reference.eq.""`)
      .eq("date", currentYear.toString())
      .order("created_at", { ascending: true })

    if (invalidError) {
      console.error("Error fetching quotes with invalid references:", invalidError)
      return {
        success: false,
        error: invalidError,
        message: `Failed to fetch quotes with invalid references: ${invalidError.message}`,
      }
    }

    // Get the next available reference number
    const { reference: nextRef, sequence: nextSeq } = await getNextAvailableReference(yearPrefix)

    // Start assigning references from the next available sequence
    let currentSeq = nextSeq
    const updates = []

    for (const quote of invalidRefs || []) {
      const paddedSeq = currentSeq.toString().padStart(3, "0")
      const newRef = `${yearPrefix}${paddedSeq}`

      updates.push({
        id: quote.id,
        oldReference: quote.reference,
        newReference: newRef,
      })

      currentSeq++
    }

    // Apply the updates
    const results = []
    for (const update of updates) {
      const { data, error } = await supabase
        .from("quotes")
        .update({ reference: update.newReference })
        .eq("id", update.id)
        .select("id, reference")

      results.push({
        success: !error,
        id: update.id,
        oldReference: update.oldReference,
        newReference: update.newReference,
        error: error?.message,
      })
    }

    return {
      success: true,
      fixedCount: results.filter((r) => r.success).length,
      failedCount: results.filter((r) => !r.success).length,
      details: results,
    }
  } catch (err) {
    console.error("Error fixing reference issues:", err)
    return {
      success: false,
      error: err,
      message: `Error fixing reference issues: ${err instanceof Error ? err.message : "Unknown error"}`,
    }
  }
}
