import { supabase } from "@/lib/database"

/**
 * Test the Supabase connection and return detailed information
 */
export async function testSupabaseConnection() {
  try {
    console.log("Testing Supabase connection...")

    // Test basic connection with a simple query
    const startTime = Date.now()
    const { data, error } = await supabase.from("quotes").select("count").limit(1)
    const endTime = Date.now()

    if (error) {
      console.error("Supabase connection error:", error)
      return {
        success: false,
        error,
        message: `Failed to connect to Supabase: ${error.message}`,
        details: {
          code: error.code,
          hint: error.hint,
          details: error.details,
        },
      }
    }

    // If connection successful, get more information
    const { data: versionData } = await supabase.rpc("get_server_version").single()
    const { data: settingsData } = await supabase.from("pg_settings").select("name,setting").limit(5)

    return {
      success: true,
      responseTime: `${endTime - startTime}ms`,
      data,
      version: versionData,
      settings: settingsData,
      message: "Supabase connection successful",
    }
  } catch (error) {
    console.error("Error testing Supabase connection:", error)
    return {
      success: false,
      error,
      message: `Exception occurred while testing Supabase connection: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

/**
 * Check if a specific table exists and has the expected structure
 */
export async function checkTableStructure(tableName: string) {
  try {
    console.log(`Checking structure of table: ${tableName}`)

    // Check if table exists
    const { data: tableExists, error: tableError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", tableName)
      .single()

    if (tableError || !tableExists) {
      return {
        success: false,
        exists: false,
        message: `Table '${tableName}' does not exist`,
      }
    }

    // Get column information
    const { data: columns, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable")
      .eq("table_name", tableName)

    if (columnsError) {
      return {
        success: false,
        exists: true,
        error: columnsError,
        message: `Failed to get columns for table '${tableName}'`,
      }
    }

    return {
      success: true,
      exists: true,
      columns,
      message: `Table '${tableName}' exists with ${columns?.length || 0} columns`,
    }
  } catch (error) {
    console.error(`Error checking table structure for ${tableName}:`, error)
    return {
      success: false,
      error,
      message: `Exception occurred while checking table structure: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

/**
 * Check a quote and its options
 */
export async function checkQuoteAndOptions(quoteId: string) {
  try {
    console.log(`Checking quote ${quoteId} and its options...`)

    // First check if the quote exists
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select(`
       id, 
       reference, 
       origin, 
       destination, 
       date, 
       status, 
       client_id, 
       created_at, 
       updated_at,
       sent_email,
       sent_email_at
     `)
      .eq("id", quoteId)
      .single()

    if (quoteError) {
      return {
        success: false,
        error: quoteError,
        message: `Failed to find quote with ID ${quoteId}: ${quoteError.message}`,
      }
    }

    // Then check for options
    const { data: options, error: optionsError } = await supabase
      .from("quote_options")
      .select("*")
      .eq("quote_id", quoteId)

    if (optionsError) {
      return {
        success: false,
        quoteFound: true,
        quote,
        error: optionsError,
        message: `Found quote but failed to get options: ${optionsError.message}`,
      }
    }

    return {
      success: true,
      quote,
      options,
      optionsCount: options?.length || 0,
      message: `Quote found with ${options?.length || 0} options`,
    }
  } catch (error) {
    console.error(`Error checking quote ${quoteId}:`, error)
    return {
      success: false,
      error,
      message: `Exception occurred while checking quote: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

/**
 * Check if a specific quote option exists and is valid
 */
export async function checkQuoteOption(optionId: string) {
  try {
    console.log(`Checking quote option ${optionId}...`)

    // Check if the option exists
    const { data: option, error: optionError } = await supabase
      .from("quote_options")
      .select("*, quotes(id, reference)")
      .eq("id", optionId)
      .single()

    if (optionError) {
      return {
        success: false,
        error: optionError,
        message: `Failed to find option with ID ${optionId}: ${optionError.message}`,
      }
    }

    // Validate required fields
    const requiredFields = ["quote_id", "name", "total_rate", "status"]

    const missingFields = requiredFields.filter(
      (field) => option[field] === undefined || option[field] === null || option[field] === "",
    )

    if (missingFields.length > 0) {
      return {
        success: false,
        option,
        missingFields,
        message: `Option found but missing required fields: ${missingFields.join(", ")}`,
      }
    }

    return {
      success: true,
      option,
      quoteReference: option.quotes?.reference || "Unknown",
      message: `Option found and valid`,
    }
  } catch (error) {
    console.error(`Error checking option ${optionId}:`, error)
    return {
      success: false,
      error,
      message: `Exception occurred while checking option: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

/**
 * Perform a comprehensive check of the database connection and structure
 */
export async function performComprehensiveCheck() {
  try {
    console.log("Starting comprehensive database check...")

    // Test basic connection
    const connectionResult = await testSupabaseConnection()
    if (!connectionResult.success) {
      return {
        success: false,
        connectionTest: connectionResult,
        message: "Database connection failed",
      }
    }

    // Check critical tables
    const tables = ["quotes", "quote_options", "clients"]
    const tableResults = {}

    for (const table of tables) {
      tableResults[table] = await checkTableStructure(table)
    }

    // Check for any quotes
    const { data: sampleQuotes, error: quotesError } = await supabase.from("quotes").select("id").limit(5)

    // If we have quotes, check one with its options
    let quoteCheckResult = null
    if (sampleQuotes && sampleQuotes.length > 0) {
      quoteCheckResult = await checkQuoteAndOptions(sampleQuotes[0].id)
    }

    return {
      success: true,
      connectionTest: connectionResult,
      tableChecks: tableResults,
      sampleQuotesFound: sampleQuotes?.length || 0,
      quotesError,
      quoteCheckResult,
      message: "Comprehensive check completed",
    }
  } catch (error) {
    console.error("Error in comprehensive check:", error)
    return {
      success: false,
      error,
      message: `Exception occurred during comprehensive check: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
