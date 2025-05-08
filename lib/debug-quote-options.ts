import { supabase } from "@/lib/database"

/**
 * Debug utility to check the quote_options table structure
 */
export async function checkQuoteOptionsTable() {
  try {
    console.log("Checking quote_options table structure...")

    // Check if the table exists
    const { data: tableExists, error: tableError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "quote_options")
      .single()

    if (tableError) {
      console.error("Error checking if quote_options table exists:", tableError)
      return {
        success: false,
        error: tableError,
        message: "Failed to check if quote_options table exists",
      }
    }

    if (!tableExists) {
      return {
        success: false,
        message: "quote_options table does not exist",
      }
    }

    // Get column information
    const { data: columns, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable")
      .eq("table_name", "quote_options")

    if (columnsError) {
      console.error("Error getting quote_options columns:", columnsError)
      return {
        success: false,
        error: columnsError,
        message: "Failed to get quote_options columns",
      }
    }

    // Check for required columns
    const requiredColumns = ["id", "quote_id", "name", "total_rate", "status", "created_at"]

    const missingColumns = requiredColumns.filter((col) => !columns.some((c) => c.column_name === col))

    if (missingColumns.length > 0) {
      return {
        success: false,
        columns,
        missingColumns,
        message: `Missing required columns: ${missingColumns.join(", ")}`,
      }
    }

    // Try to insert a test record
    const testOption = {
      quote_id: "00000000-0000-0000-0000-000000000000", // A dummy UUID that won't conflict
      name: "TEST_OPTION_DO_NOT_USE",
      total_rate: 0,
      status: "pending",
    }

    const { error: insertError } = await supabase.from("quote_options").insert([testOption]).select()

    if (insertError) {
      return {
        success: false,
        columns,
        error: insertError,
        message: `Failed to insert test record: ${insertError.message}`,
      }
    }

    // Clean up the test record
    await supabase.from("quote_options").delete().eq("name", "TEST_OPTION_DO_NOT_USE")

    return {
      success: true,
      columns,
      message: "quote_options table exists and is working correctly",
    }
  } catch (error) {
    console.error("Error checking quote_options table:", error)
    return {
      success: false,
      error,
      message: `Exception occurred while checking quote_options table: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    }
  }
}

/**
 * Debug utility to test creating an option
 */
export async function testCreateOption(quoteId: string) {
  try {
    console.log(`Testing option creation for quote ${quoteId}...`)

    // First check if the quote exists
    const { data: quote, error: quoteError } = await supabase.from("quotes").select("id").eq("id", quoteId).single()

    if (quoteError) {
      return {
        success: false,
        error: quoteError,
        message: `Quote with ID ${quoteId} not found`,
      }
    }

    // Create a test option
    const testOption = {
      quote_id: quoteId,
      name: "TEST_OPTION_DO_NOT_USE",
      description: "This is a test option",
      total_rate: 100,
      status: "pending",
    }

    const { data, error: insertError } = await supabase.from("quote_options").insert([testOption]).select()

    if (insertError) {
      return {
        success: false,
        error: insertError,
        message: `Failed to create test option: ${insertError.message}`,
      }
    }

    // Clean up the test option
    if (data && data.length > 0) {
      await supabase.from("quote_options").delete().eq("id", data[0].id)
    }

    return {
      success: true,
      message: "Successfully created and deleted a test option",
    }
  } catch (error) {
    console.error("Error testing option creation:", error)
    return {
      success: false,
      error,
      message: `Exception occurred while testing option creation: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    }
  }
}
