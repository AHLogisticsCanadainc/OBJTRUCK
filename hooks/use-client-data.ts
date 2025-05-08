"use client"

import { useState, useEffect, useCallback } from "react"
import { getSupabaseClient, testSupabaseConnection } from "@/lib/supabase-client"

export function useClientData() {
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"untested" | "connected" | "disconnected">("untested")

  // Get Supabase client with error handling
  const getClient = useCallback(() => {
    try {
      const client = getSupabaseClient()
      if (!client) {
        throw new Error("Failed to initialize database connection")
      }
      return client
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown database connection error"
      setError(errorMessage)
      setConnectionStatus("disconnected")
      throw err
    }
  }, [])

  // Test database connection
  const testConnection = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await testSupabaseConnection()

      if (!result.success) {
        setError(result.message)
        setConnectionStatus("disconnected")
        return false
      }

      setConnectionStatus("connected")
      setError(null)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to test database connection"
      setError(errorMessage)
      setConnectionStatus("disconnected")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // First test connection
      const isConnected = await testConnection()
      if (!isConnected) {
        return []
      }

      const supabase = getClient()

      // Fetch with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Database query timed out after 10 seconds")), 10000)
      })

      const queryPromise = supabase.from("clients").select("*").order("company_name", { ascending: true })

      // Race between query and timeout
      const { data, error: supabaseError } = (await Promise.race([
        queryPromise,
        timeoutPromise.then(() => {
          throw new Error("Query timed out")
        }),
      ])) as any

      if (supabaseError) {
        throw new Error(`Failed to load clients: ${supabaseError.message}`)
      }

      if (!data || !Array.isArray(data)) {
        setClients([])
        setError("No client data found or data format is unexpected")
        return []
      }

      if (data.length === 0) {
        setClients([])
        // This is not an error, just an empty result
        return []
      }

      setClients(data)
      return data
    } catch (err) {
      console.error("Error in fetchClients:", err)
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred while loading clients"
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [getClient, testConnection])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const getClientDataForAI = useCallback(() => {
    if (!clients || clients.length === 0) {
      return "No client data available. The database may be empty or there might be connection issues."
    }

    try {
      // Format client data for AI consumption
      const formattedClients = clients.map((client) => {
        if (!client || typeof client !== "object") {
          return { error: "Invalid client data format" }
        }

        return {
          id: client?.id || "Unknown ID",
          company_name: client?.company_name || "Unnamed Company",
          contact_name: client?.contact_name || "No contact name",
          email: client?.email || "No email",
          phone_number: client?.phone_number || "No phone",
          address:
            [
              client?.address_number,
              client?.address_street,
              client?.address_suite ? `Suite ${client.address_suite}` : null,
              client?.address_city,
              client?.address_state_province,
              client?.address_zip_postal,
            ]
              .filter(Boolean)
              .join(" ") || "No address",
          payment_terms: client?.payment_terms || "Not specified",
          credit_limit: client?.credit_limit !== undefined ? `$${client.credit_limit}` : "Not specified",
          active: client?.active ? "Active" : "Inactive",
          notes: client?.notes || "No notes",
        }
      })

      return JSON.stringify(formattedClients, null, 2)
    } catch (err) {
      console.error("Error formatting client data for AI:", err)
      return "Error formatting client data. Please check the console for details."
    }
  }, [clients])

  const retryFetchClients = useCallback(async () => {
    setError(null)
    return fetchClients()
  }, [fetchClients])

  return {
    clients,
    isLoading,
    error,
    connectionStatus,
    fetchClients,
    retryFetchClients,
    getClientDataForAI,
    hasClients: Array.isArray(clients) && clients.length > 0,
  }
}
