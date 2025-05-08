import { supabase } from "@/lib/database"
import type { Quote, QuoteOption } from "@/types/quotes"

/**
 * Get a quote with all its options
 */
export async function getQuoteWithOptions(quoteId: string): Promise<Quote | null> {
  try {
    // Fetch the quote
    const { data: quoteData, error: quoteError } = await supabase
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
        sent_email_at,
        clients(id, company_name, contact_name, email)
      `)
      .eq("id", quoteId)
      .single()

    if (quoteError) {
      console.error("Error fetching quote:", quoteError)
      return null
    }

    // Fetch the options for this quote
    const { data: optionsData, error: optionsError } = await supabase
      .from("quote_options")
      .select("*")
      .eq("quote_id", quoteId)
      .order("created_at", { ascending: false })

    if (optionsError) {
      console.error("Error fetching quote options:", optionsError)
      return null
    }

    // Transform the data to match our Quote type
    const quote: Quote = {
      id: quoteData.id,
      reference: quoteData.reference || undefined,
      origin: quoteData.origin,
      destination: quoteData.destination,
      date: quoteData.date,
      status: quoteData.status || "Pending",
      client_id: quoteData.client_id,
      customerName: quoteData.clients?.company_name || "Unknown Customer",
      customerEmail: quoteData.clients?.email,
      customerContact: quoteData.clients?.contact_name,
      options: optionsData as QuoteOption[],
      created_at: quoteData.created_at,
      updated_at: quoteData.updated_at,
      sent_email: quoteData.sent_email,
      sent_email_at: quoteData.sent_email_at,
    }

    return quote
  } catch (error) {
    console.error("Error in getQuoteWithOptions:", error)
    return null
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(value?: number): string {
  if (value === undefined || value === null) return "N/A"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format date for display
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return "Not set"
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  } catch (e) {
    return dateString
  }
}
