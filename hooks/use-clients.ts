"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/database"
import type { Client } from "@/types/clients"
import { toast } from "@/components/ui/use-toast"

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clientCache, setClientCache] = useState<Record<string, Client>>({})

  // Function to fetch all clients
  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Fetching clients from Supabase...")

      const { data, error } = await supabase.from("clients").select("*").order("company_name")

      if (error) {
        console.error("Supabase error fetching clients:", error)
        throw new Error(`Failed to fetch clients: ${error.message}`)
      }

      console.log(`Successfully fetched ${data?.length || 0} clients`)
      setClients(data || [])
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error fetching clients"
      console.error("Error in fetchClients:", errorMessage)
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load clients on component mount
  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  // Function to get a single client with detailed information
  const getClient = async (clientId: string): Promise<Client | null> => {
    if (!clientId) {
      console.log("No client ID provided to getClient")
      return null
    }

    // Check if we already have this client in the cache
    if (clientCache[clientId]) {
      console.log(`Using cached client data for ID: ${clientId}`)
      return clientCache[clientId]
    }

    try {
      console.log(`Fetching details for client ID: ${clientId}`)

      const { data, error } = await supabase.from("clients").select("*").eq("id", clientId).single()

      if (error) {
        console.error("Supabase error fetching client details:", error)
        return null
      }

      console.log("Successfully fetched client details:", data)

      // Add to cache
      setClientCache((prev) => ({
        ...prev,
        [clientId]: data,
      }))

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error(`Error fetching client ${clientId}:`, errorMessage)
      return null
    }
  }

  // Function to add a new client
  const addClient = async (clientData: Partial<Client>) => {
    try {
      setIsLoading(true)
      setError(null)

      console.log(`Adding new client: ${clientData.company_name}`)

      // Validate required fields
      if (!clientData.company_name) {
        throw new Error("Company name is required")
      }

      if (!clientData.contact_name) {
        throw new Error("Contact name is required")
      }

      if (!clientData.email) {
        throw new Error("Email is required")
      }

      // Validate email format
      const emailRegex = /^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$/
      if (!emailRegex.test(clientData.email)) {
        throw new Error("Invalid email format")
      }

      // Validate phone number if provided
      if (clientData.phone_number && !/^\d{10}$/.test(clientData.phone_number)) {
        throw new Error("Phone number must be 10 digits")
      }

      // Validate credit limit if provided
      if (clientData.credit_limit !== undefined && clientData.credit_limit < 0) {
        throw new Error("Credit limit must be a positive number")
      }

      const { data, error } = await supabase.from("clients").insert([clientData]).select()

      if (error) {
        console.error("Supabase error adding client:", error)
        throw new Error(`Failed to add client: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error("No data returned after adding client")
      }

      console.log("Successfully added new client:", data[0])

      // Update the local state
      setClients((prevClients) => [...prevClients, data[0]])

      toast({
        title: "Customer added",
        description: `${data[0].company_name} has been added successfully.`,
      })

      return data[0]
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error("Error in addClient:", errorMessage)
      setError(errorMessage)

      toast({
        title: "Error adding customer",
        description: errorMessage,
        variant: "destructive",
      })

      throw err // Re-throw to allow the component to handle it
    } finally {
      setIsLoading(false)
    }
  }

  // Function to update a client
  const updateClient = async (clientId: string, clientData: Partial<Client>) => {
    try {
      setIsLoading(true)
      setError(null)

      console.log(`Updating client ${clientId}:`, clientData)

      // Validate email format if provided
      if (clientData.email) {
        const emailRegex = /^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$/
        if (!emailRegex.test(clientData.email)) {
          throw new Error("Invalid email format")
        }
      }

      // Validate phone number if provided
      if (clientData.phone_number && !/^\d{10}$/.test(clientData.phone_number)) {
        throw new Error("Phone number must be 10 digits")
      }

      // Validate credit limit if provided
      if (clientData.credit_limit !== undefined && clientData.credit_limit < 0) {
        throw new Error("Credit limit must be a positive number")
      }

      const { data, error } = await supabase.from("clients").update(clientData).eq("id", clientId).select()

      if (error) {
        console.error("Supabase error updating client:", error)
        throw new Error(`Failed to update client: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error("No data returned after updating client")
      }

      console.log("Successfully updated client:", data[0])

      // Update the local state
      setClients((prevClients) => prevClients.map((client) => (client.id === clientId ? data[0] : client)))

      // Update the cache
      setClientCache((prev) => ({
        ...prev,
        [clientId]: data[0],
      }))

      toast({
        title: "Customer updated",
        description: `${data[0].company_name} has been updated successfully.`,
      })

      return data[0]
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error("Error in updateClient:", errorMessage)
      setError(errorMessage)

      toast({
        title: "Error updating customer",
        description: errorMessage,
        variant: "destructive",
      })

      throw err // Re-throw to allow the component to handle it
    } finally {
      setIsLoading(false)
    }
  }

  // Function to delete a client
  const deleteClient = async (clientId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      console.log(`Deleting client ${clientId}`)

      // Find the client name before deletion for the success message
      const clientToDelete = clients.find((client) => client.id === clientId)

      if (!clientToDelete) {
        throw new Error("Customer not found")
      }

      // Check for related records before deletion
      const checkRelatedRecords = async () => {
        try {
          // Check for quotes related to this client
          const { data: relatedQuotes, error: quotesError } = await supabase
            .from("quotes")
            .select("id")
            .eq("client_id", clientId)
            .limit(1)

          if (quotesError) {
            console.error("Error checking for related quotes:", quotesError)
            return false
          }

          if (relatedQuotes && relatedQuotes.length > 0) {
            throw new Error("Cannot delete customer with associated quotes. Please delete the quotes first.")
          }

          // Check for loads related to this client
          const { data: relatedLoads, error: loadsError } = await supabase
            .from("loads")
            .select("id")
            .eq("customer_id", clientId)
            .limit(1)

          if (loadsError) {
            console.error("Error checking for related loads:", loadsError)
            return false
          }

          if (relatedLoads && relatedLoads.length > 0) {
            throw new Error("Cannot delete customer with associated loads. Please delete the loads first.")
          }

          return true
        } catch (err) {
          throw err
        }
      }

      // Check for related records
      await checkRelatedRecords()

      // Proceed with deletion
      const { error } = await supabase.from("clients").delete().eq("id", clientId)

      if (error) {
        console.error("Supabase error deleting client:", error)
        throw new Error(`Failed to delete customer: ${error.message}`)
      }

      console.log(`Successfully deleted client ${clientId}`)

      // Update the local state
      setClients((prevClients) => prevClients.filter((client) => client.id !== clientId))

      // Remove from cache
      setClientCache((prev) => {
        const newCache = { ...prev }
        delete newCache[clientId]
        return newCache
      })

      toast({
        title: "Customer deleted",
        description: clientToDelete ? `${clientToDelete.company_name} has been deleted.` : "Customer has been deleted.",
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error("Error in deleteClient:", errorMessage)
      setError(errorMessage)

      toast({
        title: "Error deleting customer",
        description: errorMessage,
        variant: "destructive",
      })

      throw err // Re-throw to allow the component to handle it
    } finally {
      setIsLoading(false)
    }
  }

  // Function to refresh the client list
  const refreshClients = () => {
    return fetchClients()
  }

  return {
    clients,
    isLoading,
    error,
    getClient,
    addClient,
    updateClient,
    deleteClient,
    refreshClients,
  }
}
