import { getSupabaseClient } from "@/lib/database"

/**
 * Test the Supabase connection and return detailed information
 */
export async function testSupabaseConnection() {
  try {
    console.log("[SUPABASE CONNECTION TEST] Starting...")

    // Get the Supabase client using our singleton pattern
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("[SUPABASE CONNECTION TEST] Supabase client is undefined")
      return {
        success: false,
        error: "Supabase client is undefined",
        message: "Failed to initialize Supabase client",
      }
    }

    // Test basic connection with a simple query
    const startTime = Date.now()
    const { data, error } = await supabase.from("quotes").select("count").limit(1)
    const endTime = Date.now()

    if (error) {
      console.error("[SUPABASE CONNECTION TEST] Error:", error)
      return {
        success: false,
        error: error.message,
        message: `Failed to connect to Supabase: ${error.message}`,
        details: {
          code: error.code,
          hint: error.hint,
          details: error.details,
        },
      }
    }

    console.log("[SUPABASE CONNECTION TEST] Successful")
    return {
      success: true,
      responseTime: `${endTime - startTime}ms`,
      data,
      message: "Supabase connection successful",
    }
  } catch (error) {
    console.error("[SUPABASE CONNECTION TEST] Exception:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: `Exception occurred while testing Supabase connection: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Other functions remain the same...
