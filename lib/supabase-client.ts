import { getSupabaseClient } from "@/lib/database"

// Function to test Supabase connection
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
