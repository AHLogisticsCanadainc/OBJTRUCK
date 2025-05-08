"use client"

import { useState, useEffect, useCallback } from "react"
import type { Quote, QuoteStatus, QuoteSortField, SortDirection, QuoteFilters, NewQuote } from "@/types/quotes"
import { supabase } from "@/lib/database"

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<QuoteSortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [filters, setFilters] = useState<QuoteFilters>({
    searchTerm: "",
    status: "all",
    dateRange: {},
  })

  // Load quotes from Supabase
  const fetchQuotes = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Fetching quotes from Supabase...")

      // Fetch quotes from Supabase with client information
      const { data: quotesData, error: quotesError } = await supabase
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
          clients(id, company_name)
        `)
        .order("created_at", { ascending: false })

      if (quotesError) {
        console.error("Supabase error fetching quotes:", quotesError)
        throw new Error(`Failed to fetch quotes: ${quotesError.message}`)
      }

      console.log(`Successfully fetched ${quotesData?.length || 0} quotes`)

      // Transform the data to match our Quote type
      const transformedQuotes = quotesData.map((quote) => ({
        id: quote.id,
        reference: quote.reference || undefined,
        origin: quote.origin,
        destination: quote.destination,
        date: quote.date,
        status: quote.status || "Pending",
        client_id: quote.client_id,
        customerName: quote.clients?.company_name || "Unknown Customer",
        options: [], // We'll fetch options separately if needed
        created_at: quote.created_at,
        updated_at: quote.updated_at,
        sent_email: quote.sent_email,
        sent_email_at: quote.sent_email_at,
      }))

      setQuotes(transformedQuotes)
      return transformedQuotes
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error fetching quotes"
      console.error("Error in fetchQuotes:", errorMessage)
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch a single quote by ID to get the latest data
  const fetchQuoteById = useCallback(async (quoteId: string) => {
    try {
      console.log(`Fetching latest data for quote ${quoteId}...`)

      const { data, error } = await supabase
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
          clients(id, company_name)
        `)
        .eq("id", quoteId)
        .single()

      if (error) {
        console.error(`Error fetching quote ${quoteId}:`, error)
        throw new Error(`Failed to fetch quote: ${error.message}`)
      }

      if (!data) {
        throw new Error(`Quote with ID ${quoteId} not found`)
      }

      console.log(`Successfully fetched latest data for quote ${quoteId}:`, data)

      // Transform the data to match our Quote type
      const quote: Quote = {
        id: data.id,
        reference: data.reference || undefined,
        origin: data.origin,
        destination: data.destination,
        date: data.date,
        status: data.status || "Pending",
        client_id: data.client_id,
        customerName: data.clients?.company_name || "Unknown Customer",
        options: [], // We'll fetch options separately if needed
        created_at: data.created_at,
        updated_at: data.updated_at,
        sent_email: data.sent_email,
        sent_email_at: data.sent_email_at,
      }

      // Update this quote in our local state
      setQuotes((prevQuotes) => prevQuotes.map((q) => (q.id === quoteId ? quote : q)))

      return quote
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error(`Error fetching quote ${quoteId}:`, errorMessage)
      return null
    }
  }, [])

  // Load quotes on component mount
  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  // Filter quotes based on search term, status, and date range
  const filteredQuotes = quotes.filter((quote) => {
    // Search term filter
    const matchesSearch =
      filters.searchTerm === "" ||
      (quote.customerName && quote.customerName.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      quote.origin.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      quote.destination.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (quote.reference && quote.reference.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      quote.id.toLowerCase().includes(filters.searchTerm.toLowerCase())

    // Status filter
    const matchesStatus =
      !filters.status || filters.status === "all" || quote.status.toLowerCase() === filters.status.toLowerCase()

    // Date range filter
    let matchesDateRange = true
    if (filters.dateRange.from) {
      const quoteDate = new Date(quote.date)
      matchesDateRange = quoteDate >= filters.dateRange.from
    }
    if (filters.dateRange.to && matchesDateRange) {
      const quoteDate = new Date(quote.date)
      matchesDateRange = quoteDate <= filters.dateRange.to
    }

    return matchesSearch && matchesStatus && matchesDateRange
  })

  // Sort quotes
  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    if (sortField === "date" || sortField === "created_at" || sortField === "updated_at") {
      const dateA = new Date(a[sortField] || "")
      const dateB = new Date(b[sortField] || "")
      return sortDirection === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
    }

    // For string fields
    const valueA = String(a[sortField as keyof Quote] || "").toLowerCase()
    const valueB = String(b[sortField as keyof Quote] || "").toLowerCase()

    if (sortDirection === "asc") {
      return valueA.localeCompare(valueB)
    } else {
      return valueB.localeCompare(valueA)
    }
  })

  // Create a new quote in Supabase
  const createQuote = async (newQuoteData: NewQuote) => {
    try {
      setIsLoading(true)
      console.log("Creating new quote:", newQuoteData)

      // Generate a unique reference number
      const reference = await generateUniqueReference()
      console.log("Generated unique reference:", reference)

      // Prepare the quote data for Supabase
      const quoteData = {
        reference,
        origin: newQuoteData.origin,
        destination: newQuoteData.destination,
        date: newQuoteData.date || new Date().toISOString().split("T")[0],
        status: "Pending", // Default status
        client_id: newQuoteData.client_id,
      }

      // Insert the quote into Supabase
      const { data, error } = await supabase
        .from("quotes")
        .insert([quoteData])
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
        clients(id, company_name)
      `)

      if (error) {
        console.error("Supabase error creating quote:", error)
        throw new Error(`Failed to create quote: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error("No data returned from quote creation")
      }

      console.log("Successfully created quote:", data[0])

      // Transform the returned data to match our Quote type
      const newQuote: Quote = {
        id: data[0].id,
        reference: data[0].reference,
        origin: data[0].origin,
        destination: data[0].destination,
        date: data[0].date,
        status: data[0].status,
        client_id: data[0].client_id,
        customerName: data[0].clients?.company_name || "Unknown Customer",
        options: [],
        created_at: data[0].created_at,
        updated_at: data[0].updated_at,
      }

      // Update the local state
      setQuotes([newQuote, ...quotes])

      return newQuote
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error("Error creating quote:", errorMessage)
      setError(`Failed to create quote: ${errorMessage}`)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Add this new function to generate unique references
  const generateUniqueReference = async (): Promise<string> => {
    const currentYear = new Date().getFullYear()
    const yearPrefix = `Q-${currentYear}-`

    try {
      // Query to find all references for the current year
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

      console.log(`Generated new reference: ${newReference} (next after ${maxSequence})`)
      return newReference
    } catch (err) {
      console.error("Error generating unique reference:", err)
      // Fallback to a timestamp-based reference if there's an error
      const timestamp = Date.now().toString().slice(-6)
      return `${yearPrefix}ERR${timestamp}`
    }
  }

  // Add this function after the generateUniqueReference function
  const checkReferenceExists = async (reference: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.from("quotes").select("id").eq("reference", reference).maybeSingle()

      if (error) {
        console.error("Error checking reference existence:", error)
        throw new Error(`Failed to check reference: ${error.message}`)
      }

      return !!data // Returns true if data exists (reference found), false otherwise
    } catch (err) {
      console.error("Error in checkReferenceExists:", err)
      // In case of error, assume it might exist to be safe
      return true
    }
  }

  // Update a quote in Supabase
  const updateQuote = async (quoteId: string, updatedData: Partial<Quote>) => {
    try {
      setIsLoading(true)
      console.log(`Updating quote ${quoteId}:`, updatedData)

      // Prepare the data for Supabase - only include fields that are in the database schema
      const updateData: Record<string, any> = {}

      // Only include fields that exist in the database schema
      if (updatedData.reference !== undefined) updateData.reference = updatedData.reference
      if (updatedData.origin !== undefined) updateData.origin = updatedData.origin
      if (updatedData.destination !== undefined) updateData.destination = updatedData.destination
      if (updatedData.date !== undefined) updateData.date = updatedData.date
      if (updatedData.status !== undefined) updateData.status = updatedData.status
      if (updatedData.client_id !== undefined) updateData.client_id = updatedData.client_id

      // Add the email fields
      if (updatedData.sent_email !== undefined) updateData.sent_email = updatedData.sent_email
      if (updatedData.sent_email_at !== undefined) updateData.sent_email_at = updatedData.sent_email_at

      // Don't manually set updated_at as your trigger will handle this
      console.log("Sending update data to Supabase:", updateData)

      // First, update the quote
      const { error: updateError } = await supabase.from("quotes").update(updateData).eq("id", quoteId)

      if (updateError) {
        console.error("Supabase error updating quote:", updateError)
        throw new Error(`Failed to update quote: ${updateError.message}`)
      }

      console.log(`Quote ${quoteId} updated successfully. Fetching latest data...`)

      // After successful update, fetch the latest data
      const updatedQuote = await fetchQuoteById(quoteId)

      if (!updatedQuote) {
        throw new Error("Failed to fetch updated quote data")
      }

      console.log("Successfully updated quote with latest data:", updatedQuote)
      return updatedQuote
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error("Error updating quote:", errorMessage)
      setError(`Failed to update quote: ${errorMessage}`)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a quote from Supabase
  const deleteQuote = async (id: string) => {
    try {
      setIsLoading(true)
      console.log(`Deleting quote ${id}`)

      // Delete the quote from Supabase
      const { error } = await supabase.from("quotes").delete().eq("id", id)

      if (error) {
        console.error("Supabase error deleting quote:", error)
        throw new Error(`Failed to delete quote: ${error.message}`)
      }

      console.log(`Successfully deleted quote ${id}`)

      // Update the local state
      setQuotes(quotes.filter((quote) => quote.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error("Error deleting quote:", errorMessage)
      setError(`Failed to delete quote: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Duplicate a quote
  const duplicateQuote = async (quote: Quote) => {
    try {
      setIsLoading(true)
      console.log(`Duplicating quote ${quote.id}`)

      // Generate a unique reference number for the duplicate
      const reference = await generateUniqueReference()

      // Prepare the quote data for Supabase
      const quoteData = {
        reference,
        origin: quote.origin,
        destination: quote.destination,
        date: new Date().toISOString().split("T")[0], // Use current date for the duplicate
        status: "Pending", // Reset status to pending
        client_id: quote.client_id,
      }

      // Insert the quote into Supabase
      const { data, error } = await supabase
        .from("quotes")
        .insert([quoteData])
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
        clients(id, company_name)
      `)

      if (error) {
        console.error("Supabase error duplicating quote:", error)
        throw new Error(`Failed to duplicate quote: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error("No data returned from quote duplication")
      }

      console.log("Successfully duplicated quote:", data[0])

      // Transform the returned data to match our Quote type
      const newQuote: Quote = {
        id: data[0].id,
        reference: data[0].reference,
        origin: data[0].origin,
        destination: data[0].destination,
        date: data[0].date,
        status: data[0].status,
        client_id: data[0].client_id,
        customerName: data[0].clients?.company_name || "Unknown Customer",
        options: [],
        created_at: data[0].created_at,
        updated_at: data[0].updated_at,
      }

      // Update the local state
      setQuotes([newQuote, ...quotes])

      return newQuote
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error("Error duplicating quote:", errorMessage)
      setError(`Failed to duplicate quote: ${errorMessage}`)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle sort direction or change sort field
  const handleSort = (field: QuoteSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      searchTerm: "",
      status: "all",
      dateRange: {},
    })
    setSortField("date")
    setSortDirection("desc")
  }

  // Update search term
  const setSearchTerm = (searchTerm: string) => {
    setFilters({ ...filters, searchTerm })
  }

  // Update status filter
  const setStatusFilter = (status: QuoteStatus | "all") => {
    setFilters({ ...filters, status })
  }

  // Update date range filter
  const setDateRangeFilter = (dateRange: { from?: Date; to?: Date }) => {
    setFilters({ ...filters, dateRange })
  }

  // Refresh quotes
  const refreshQuotes = () => {
    return fetchQuotes()
  }

  // Add this to the return statement of the useQuotes hook
  return {
    quotes: sortedQuotes,
    totalQuotes: quotes.length,
    isLoading,
    error,
    filters,
    sortField,
    sortDirection,
    createQuote,
    updateQuote,
    deleteQuote,
    duplicateQuote,
    handleSort,
    resetFilters,
    setSearchTerm,
    setStatusFilter,
    setDateRangeFilter,
    refreshQuotes,
    fetchQuoteById,
    checkReferenceExists, // Add this line
    generateUniqueReference, // Add this line
  }
}
