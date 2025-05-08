import { supabase } from "@/lib/database"

/**
 * Debug utility to check Supabase connection and table structure
 */
export async function checkSupabaseConnection() {
  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase.from("quotes").select("count").limit(1)

    if (connectionError) {
      console.error("Supabase connection error:", connectionError)
      return {
        success: false,
        error: connectionError,
        message: "Failed to connect to Supabase",
      }
    }

    console.log("Supabase connection successful")

    // Check quote_options table structure
    const { data: tableInfo, error: tableError } = await supabase.rpc("get_table_info", { table_name: "quote_options" })

    if (tableError) {
      console.error("Error getting table info:", tableError)
      return {
        success: true,
        connection: "OK",
        tableInfo: "Failed to retrieve",
        error: tableError,
      }
    }

    return {
      success: true,
      connection: "OK",
      tableInfo,
    }
  } catch (error) {
    console.error("Error checking Supabase:", error)
    return {
      success: false,
      error,
      message: "Exception occurred while checking Supabase",
    }
  }
}

/**
 * Debug utility to log a test option to console
 */
export function logOptionStructure(option: any) {
  console.log("Option structure:", {
    ...option,
    _type: typeof option,
    _keys: Object.keys(option),
    _hasQuoteId: !!option.quote_id,
    _numericFields: {
      total_rate: typeof option.total_rate,
      weight: typeof option.weight,
      distance: typeof option.distance,
      truckmpg: typeof option.truckmpg,
      driverratepermile: typeof option.driverratepermile,
      costperliter: typeof option.costperliter,
    },
  })
}
