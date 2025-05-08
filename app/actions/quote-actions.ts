"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/database"

/**
 * Delete a quote and all its associated options
 */
export async function deleteQuoteWithOptions(quoteId: string) {
  if (!quoteId) {
    return {
      success: false,
      error: "No quote ID provided",
    }
  }

  try {
    console.log(`Deleting quote ${quoteId} and all its options`)

    // First, delete all options associated with this quote
    const { error: optionsError } = await supabase.from("quote_options").delete().eq("quote_id", quoteId)

    if (optionsError) {
      console.error("Error deleting quote options:", optionsError)
      throw new Error(`Failed to delete quote options: ${optionsError.message}`)
    }

    // Then delete the quote itself
    const { error: quoteError } = await supabase.from("quotes").delete().eq("id", quoteId)

    if (quoteError) {
      console.error("Error deleting quote:", quoteError)
      throw new Error(`Failed to delete quote: ${quoteError.message}`)
    }

    // Revalidate the dashboard page to update the UI
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Quote and associated options deleted successfully",
    }
  } catch (error) {
    console.error("Error in deleteQuoteWithOptions:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
