import { supabase } from "@/lib/database"
import type { Quote, QuoteOption } from "@/types/quotes"

/**
 * Get a quote with all its options
 */
export async function getQuoteWithOptions(quoteId: string): Promise<Quote | null> {
  try {
    console.log(`getQuoteWithOptions called for quote ID: ${quoteId}`)

    if (!quoteId) {
      console.error("Invalid quote ID provided to getQuoteWithOptions")
      return null
    }

    // Fetch the quote
    console.log(`Fetching quote data for ID: ${quoteId}`)
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

      // Check if the quote exists at all
      const { data: basicCheck, error: basicError } = await supabase
        .from("quotes")
        .select("id, client_id")
        .eq("id", quoteId)
        .single()

      if (basicError) {
        console.error("Quote does not exist in database:", basicError)
      } else {
        console.error("Quote exists but failed to load with join. Basic data:", basicCheck)
      }

      return null
    }

    if (!quoteData) {
      console.error("No quote data returned for ID:", quoteId)
      return null
    }

    console.log(`Quote data retrieved:`, {
      id: quoteData.id,
      reference: quoteData.reference,
      client_id: quoteData.client_id,
      client_info: quoteData.clients ? "Present" : "Missing",
    })

    // If client_id exists but clients join returned null, try to fetch client directly
    if (quoteData.client_id && !quoteData.clients) {
      console.log(`Client join failed, fetching client directly with ID: ${quoteData.client_id}`)
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id, company_name, contact_name, email")
        .eq("id", quoteData.client_id)
        .single()

      if (!clientError && clientData) {
        console.log("Successfully fetched client directly:", clientData.company_name)
        quoteData.clients = clientData
      } else {
        console.error("Failed to fetch client directly:", clientError)
      }
    }

    // Fetch the options for this quote
    console.log(`Fetching options for quote ID: ${quoteId}`)
    const { data: optionsData, error: optionsError } = await supabase
      .from("quote_options")
      .select("*")
      .eq("quote_id", quoteId)
      .order("created_at", { ascending: false })

    if (optionsError) {
      console.error("Error fetching quote options:", optionsError)
      // Continue with the quote data even if options fail to load
    }

    console.log(`Retrieved ${optionsData?.length || 0} options for quote ID: ${quoteId}`)

    // Transform the data to match our Quote type
    const quote: Quote = {
      id: quoteData.id,
      reference: quoteData.reference || undefined,
      origin: quoteData.origin || "Unknown Origin",
      destination: quoteData.destination || "Unknown Destination",
      date: quoteData.date || new Date().toISOString().split("T")[0],
      status: quoteData.status || "Pending",
      client_id: quoteData.client_id,
      customerName: quoteData.clients?.company_name || "Unknown Customer",
      customerEmail: quoteData.clients?.email,
      customerContact: quoteData.clients?.contact_name,
      options: (optionsData as QuoteOption[]) || [],
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
