"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { supabase } from "@/lib/database"

type CarrierSearchParams = {
  dotNumber?: string
  mcNumber?: string
  name?: string
  start?: number
  size?: number
}

type CarrierDetailParams = {
  dotNumber: string
  type: "basics" | "cargo-carried" | "operation-classification" | "oos" | "docket-numbers" | "authority"
}

type CarrierDetailRequest = {
  dotNumber: string
  type: string
}

// Number of carriers to process in each batch
const BATCH_SIZE = 10

export function useCarrierLookup() {
  // Add these new state variables at the top of the useCarrierLookup function
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const [useDbKey, setUseDbKey] = useState<boolean>(true) // Default to true
  const [processingProgress, setProcessingProgress] = useState(0)
  const [totalToProcess, setTotalToProcess] = useState(0)
  const [existingCarriers, setExistingCarriers] = useState<Record<string, boolean>>({})
  const [isCheckingExisting, setIsCheckingExisting] = useState(false)

  // Add a ref to track if processing should be cancelled
  const cancelProcessingRef = useRef(false)

  // Function to cancel ongoing processing
  const cancelProcessing = useCallback(() => {
    cancelProcessingRef.current = true
    console.log("Cancelling carrier processing...")

    // Reset processing state after a short delay
    setTimeout(() => {
      setIsSaving(false)
      setProcessingProgress(0)
      setTotalToProcess(0)
      cancelProcessingRef.current = false
    }, 500)
  }, [])

  // Helper function to sanitize endpoint names for API requests
  const sanitizeEndpoint = (endpoint: string): string => {
    // Remove spaces and special characters that might cause issues
    return endpoint.replace(/\s+/g, "").toLowerCase()
  }

  // Update the refreshApiKey function to prioritize the database key and cache it locally
  // This change ensures consistency with our new default setting
  const refreshApiKey = useCallback(async () => {
    try {
      // First check if we should use the database key
      const useDbKeyStr = localStorage.getItem("use-db-api-key")
      const shouldUseDbKey = useDbKeyStr ? JSON.parse(useDbKeyStr) : true // Default to true if not set
      setUseDbKey(shouldUseDbKey)

      console.log("Refreshing API key, using database key:", shouldUseDbKey)

      // Check if we already have the key in localStorage
      const storedKey = localStorage.getItem("fmcsa-api-key")

      if (storedKey) {
        console.log("Found API key in localStorage")
        // If we have a stored key, use it directly (no need to parse)
        setApiKey(storedKey)
        return storedKey // Return the key for immediate use
      }

      if (shouldUseDbKey) {
        console.log("Fetching API key from database")
        // Fetch from database only if we don't have a valid cached key
        const { data, error } = await supabase.from("api_keys").select("api_key").eq("id", 6).eq("is_active", true)

        if (error) {
          console.error("Error fetching API key from database:", error)
          setApiKey(null)
          return null
        }

        // Check if we got any results
        if (!data || data.length === 0) {
          console.log("No active API key found in database with ID 6")
          setApiKey(null)
          return null
        }

        // Use the first result
        const apiKeyRecord = data[0]
        if (apiKeyRecord.api_key) {
          console.log("Successfully retrieved API key from database")
          // Store the key as a plain string, not JSON stringified
          localStorage.setItem("fmcsa-api-key", apiKeyRecord.api_key)
          setApiKey(apiKeyRecord.api_key)
          return apiKeyRecord.api_key // Return the key for immediate use
        } else {
          console.log("API key record exists but has no value")
          setApiKey(null)
          return null
        }
      } else {
        // If we're not using DB key and don't have a stored key, set to null
        console.log("Not using database key and no key found in localStorage")
        setApiKey(null)
        return null
      }
    } catch (err) {
      console.error("Error refreshing API key:", err)
      setApiKey(null)
      return null
    }
  }, [])

  const fetchDocketNumbers = useCallback(async (dotNumber: string): Promise<string | null> => {
    // Get the API key directly from localStorage to ensure it's the most current
    const currentApiKey = localStorage.getItem("fmcsa-api-key")

    if (!currentApiKey) {
      console.warn("FMCSA API key is not configured. Cannot fetch docket numbers.")
      return null // Or throw an error if it's critical
    }

    try {
      const endpoint = `/carriers/${dotNumber}/docket-numbers`
      const response = await fetch(
        `/api/carrier-lookup?endpoint=${encodeURIComponent(endpoint)}&apiKey=${encodeURIComponent(currentApiKey)}`,
      )

      if (!response.ok) {
        console.error(`Failed to fetch docket numbers for DOT ${dotNumber}: ${response.status}`)
        return null
      }

      const data = await response.json()

      // Check if data.content is an array and has at least one element
      if (Array.isArray(data.content) && data.content.length > 0) {
        // Extract the mcNumber from the first element
        const mcNumber = data.content[0].mcNumber
        return mcNumber || null // Return the mcNumber if it exists, otherwise return null
      } else {
        console.log(`No docket numbers found for DOT ${dotNumber}`)
        return null // No docket numbers found
      }
    } catch (error) {
      console.error(`Error fetching docket numbers for DOT ${dotNumber}:`, error)
      return null
    }
  }, [])

  // Add this function after the getCarrierDetails function
  const saveCarrierToDatabase = useCallback(
    async (carrierData: any) => {
      // Check if processing has been cancelled
      if (cancelProcessingRef.current) {
        console.log("Carrier save cancelled")
        return { success: false, cancelled: true }
      }

      if (!carrierData || !carrierData.carrier) {
        return { success: false, error: "No carrier data to save" }
      }

      setSaveError(null)

      try {
        const carrier = carrierData.carrier
        console.log("Saving carrier data:", carrier)

        // Get the DOT number
        const dotNumber = carrier.dotNumber?.toString()

        // Fetch docket numbers for this carrier
        let mcNumber = null
        if (dotNumber) {
          try {
            // Always attempt to fetch docket numbers - the function will handle API key availability
            mcNumber = await fetchDocketNumbers(dotNumber)
            console.log(`Fetched MC number for DOT# ${dotNumber}: ${mcNumber || "None found"}`)
          } catch (err) {
            console.error(`Error fetching docket numbers for DOT# ${dotNumber}:`, err)
            // Continue with the save process even if docket number fetch fails
          }
        } else {
          console.log(`Cannot fetch docket numbers: DOT number is not available`)
        }

        // Check again if processing has been cancelled after docket number fetch
        if (cancelProcessingRef.current) {
          console.log("Carrier save cancelled after docket number fetch")
          return { success: false, cancelled: true }
        }

        // Process cargo carried data - ensure it's an array of strings
        let cargoCarriedArray: string[] = []
        if (carrier.cargoCarried) {
          cargoCarriedArray = Object.entries(carrier.cargoCarried)
            .filter(([_, value]) => value === "Y")
            .map(([key]) => {
              // Format the key for better readability
              return key.replace(/([A-Z])/g, " $1").trim()
            })
        }
        console.log("Cargo carried array:", cargoCarriedArray)

        // Process insurance data
        const bipdInsuranceOnFile =
          carrier.bipdInsuranceOnFile === "Y"
            ? {
                status: "On file",
                required: carrier.bipdInsuranceRequired === "Y",
                amount: carrier.bipdRequired || null,
              }
            : null

        const cargoInsuranceOnFile =
          carrier.cargoInsuranceOnFile === "Y"
            ? {
                status: "On file",
                required: carrier.cargoInsuranceRequired === "Y",
                amount: carrier.cargoRequired || null,
              }
            : null

        // Prepare the data for saving
        const dataToSave = {
          dot_number: dotNumber,
          mc_mx_ff_number: mcNumber || carrier.mcNumber || null, // Use fetched MC number or fallback to carrier.mcNumber
          legal_name: carrier.legalName,
          dba_name: carrier.dbaName,
          entity_type: carrier.carrierOperation?.entityType,
          carrier_operation: carrier.carrierOperation?.carrierOperationDesc,
          cargo_carried: cargoCarriedArray,
          physical_address: {
            street: carrier.phyStreet,
            city: carrier.phyCity,
            state: carrier.phyState,
            zip: carrier.phyZipcode,
            country: carrier.phyCountry,
          },
          mailing_address: carrier.mailingStreet
            ? {
                street: carrier.mailingStreet,
                city: carrier.mailingCity,
                state: carrier.mailingState,
                zip: carrier.mailingZipcode,
                country: carrier.mailingCountry,
              }
            : null,
          phone: carrier.telephone,
          email: carrier.email,
          insurance_required: carrier.bipdInsuranceRequired === "Y" || carrier.cargoInsuranceRequired === "Y",
          insurance_on_file: {
            bipd: carrier.bipdInsuranceOnFile === "Y",
            cargo: carrier.cargoInsuranceOnFile === "Y",
          },
          bipd_insurance_required: carrier.bipdInsuranceRequired === "Y",
          bipd_insurance_on_file: bipdInsuranceOnFile,
          cargo_insurance_required: carrier.cargoInsuranceRequired === "Y",
          cargo_insurance_on_file: cargoInsuranceOnFile,
          safety_rating: carrier.safetyRating,
          out_of_service_date: carrier.outOfServiceDate || null,
          operating_status: carrier.statusCode === "A" ? "Active" : "Inactive",
          fleet_size: carrier.totalPowerUnits ? Number.parseInt(carrier.totalPowerUnits) : null,
          driver_count: carrier.totalDrivers ? Number.parseInt(carrier.totalDrivers) : null,
          raw_response: carrierData,
          data_source: "FMCSA",
          is_saved: true,
          lookup_date: new Date().toISOString(),
        }

        // Add logging to help debug
        console.log(
          `Carrier data prepared for saving. DOT: ${dataToSave.dot_number}, MC/Docket: ${dataToSave.mc_mx_ff_number}`,
        )

        // Check if the carrier already exists
        const { data: existingCarrier } = await supabase
          .from("carrier_lookup_results")
          .select("id, updated_at, raw_response, mc_mx_ff_number")
          .eq("dot_number", dataToSave.dot_number)
          .maybeSingle()

        // Final check for cancellation before database operations
        if (cancelProcessingRef.current) {
          console.log("Carrier save cancelled before database operation")
          return { success: false, cancelled: true }
        }

        let result

        if (existingCarrier) {
          // Update the existing carriers map
          setExistingCarriers((prev) => ({
            ...prev,
            [dataToSave.dot_number]: true,
          }))

          // Check if data has changed before updating
          const existingData = existingCarrier.raw_response?.carrier || {}
          const newData = carrierData.carrier || {}

          // If we have a new MC number and the existing one is null or different, we should update
          const mcNumberChanged =
            dataToSave.mc_mx_ff_number && existingCarrier.mc_mx_ff_number !== dataToSave.mc_mx_ff_number

          // Compare key fields to see if an update is needed
          const needsUpdate =
            mcNumberChanged ||
            existingData.legalName !== newData.legalName ||
            existingData.dbaName !== newData.dbaName ||
            existingData.statusCode !== newData.statusCode ||
            existingData.totalDrivers !== newData.totalDrivers ||
            existingData.totalPowerUnits !== newData.totalPowerUnits ||
            existingData.phyStreet !== newData.phyStreet ||
            existingData.phyCity !== newData.phyCity ||
            existingData.phyState !== newData.phyState ||
            existingData.phyZipcode !== newData.phyZipcode

          if (needsUpdate) {
            // Update the existing record
            result = await supabase
              .from("carrier_lookup_results")
              .update({
                ...dataToSave,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingCarrier.id)

            console.log(`Updated carrier record. DOT: ${dataToSave.dot_number}, MC: ${dataToSave.mc_mx_ff_number}`)
          } else {
            // No update needed, just update the lookup date
            result = await supabase
              .from("carrier_lookup_results")
              .update({
                lookup_date: new Date().toISOString(),
              })
              .eq("id", existingCarrier.id)

            console.log(`No updates needed for carrier. DOT: ${dataToSave.dot_number}`)
          }
        } else {
          // Insert a new record
          result = await supabase.from("carrier_lookup_results").insert(dataToSave)
          console.log(`Inserted new carrier record. DOT: ${dataToSave.dot_number}, MC: ${dataToSave.mc_mx_ff_number}`)

          // Update the existing carriers map with the newly added carrier
          if (!result.error) {
            setExistingCarriers((prev) => ({
              ...prev,
              [dataToSave.dot_number]: true,
            }))
          }
        }

        if (result.error) {
          console.error("Database error:", result.error)
          throw result.error
        }

        return { success: true }
      } catch (err: any) {
        console.error("Error saving carrier data:", err)
        setSaveError(err.message || "Failed to save carrier data")
        return { success: false, error: err.message }
      }
    },
    [fetchDocketNumbers],
  )

  // Process carriers in batches to avoid overwhelming the database
  const processBatch = useCallback(
    async (carriers: any[], startIndex: number) => {
      // Check if processing has been cancelled
      if (cancelProcessingRef.current) {
        console.log("Batch processing cancelled")
        return
      }

      const endIndex = Math.min(startIndex + BATCH_SIZE, carriers.length)
      const batch = carriers.slice(startIndex, endIndex)

      for (const item of batch) {
        // Check if processing has been cancelled before each carrier
        if (cancelProcessingRef.current) {
          console.log("Carrier processing cancelled during batch")
          return
        }

        await saveCarrierToDatabase(item)
        setProcessingProgress((prev) => prev + 1)
      }

      if (endIndex < carriers.length && !cancelProcessingRef.current) {
        // Process next batch with a small delay to allow UI updates
        setTimeout(() => {
          processBatch(carriers, endIndex)
        }, 100)
      } else {
        // All batches processed or processing cancelled
        setIsSaving(false)
        setIsSaved(!cancelProcessingRef.current)

        if (cancelProcessingRef.current) {
          console.log("Batch processing completed (cancelled)")
          cancelProcessingRef.current = false
        } else {
          console.log("Batch processing completed successfully")
        }
      }
    },
    [saveCarrierToDatabase],
  )

  // Check which carriers already exist in the database
  const checkExistingCarriers = useCallback(async (carriers: any[]) => {
    if (!carriers || carriers.length === 0) return {}

    setIsCheckingExisting(true)
    const existingMap: Record<string, boolean> = {}

    try {
      // Extract DOT numbers from carriers
      const dotNumbers = carriers.map((item) => item.carrier?.dotNumber?.toString()).filter(Boolean)

      if (dotNumbers.length === 0) {
        setIsCheckingExisting(false)
        return existingMap
      }

      // Query database for existing carriers
      const { data, error } = await supabase
        .from("carrier_lookup_results")
        .select("dot_number")
        .in("dot_number", dotNumbers)

      if (error) {
        console.error("Error checking existing carriers:", error)
        setIsCheckingExisting(false)
        return existingMap
      }

      // Create a map of existing DOT numbers
      if (data && data.length > 0) {
        data.forEach((item) => {
          if (item.dot_number) {
            existingMap[item.dot_number] = true
          }
        })
      }

      setExistingCarriers(existingMap)
      return existingMap
    } catch (err) {
      console.error("Error checking existing carriers:", err)
      return existingMap
    } finally {
      setIsCheckingExisting(false)
    }
  }, [])

  // Refresh API key on mount
  useEffect(() => {
    refreshApiKey()
  }, [refreshApiKey])

  // Modify the searchCarrier function to automatically save results
  const searchCarrier = useCallback(
    async (params: CarrierSearchParams) => {
      // Reset the cancel flag
      cancelProcessingRef.current = false

      // Refresh the API key before searching to ensure we have the latest
      await refreshApiKey()

      // Get the API key directly from localStorage to ensure it's the most current
      const currentApiKey = localStorage.getItem("fmcsa-api-key")

      if (!currentApiKey) {
        setError("FMCSA API key is not configured. Please add your API key in the settings.")
        return null
      }

      console.log("Using API key for search:", currentApiKey.substring(0, 4) + "...")

      setLoading(true)
      setError(null)
      setResults(null)
      setIsSaved(false)
      setIsSaving(false)
      setProcessingProgress(0)
      setTotalToProcess(0)
      setExistingCarriers({})

      try {
        let endpoint = ""
        const { start, size } = params

        // Use the user-provided size or default to appropriate values
        const pageSize = size || (params.name ? 100 : 25)
        const paginationParams = start !== undefined ? `?start=${start}&size=${pageSize}` : `?size=${pageSize}`

        if (params.dotNumber) {
          endpoint = `/carriers/${params.dotNumber}`
        } else if (params.mcNumber) {
          endpoint = `/carriers/docket-number/${params.mcNumber}`
        } else if (params.name) {
          endpoint = `/carriers/name/${encodeURIComponent(params.name)}${paginationParams}`
          console.log(`Name search with page size: ${pageSize}`)
        } else {
          throw new Error("At least one search parameter is required")
        }

        console.log(`Searching with endpoint: ${endpoint}`)

        const response = await fetch(
          `/api/carrier-lookup?endpoint=${encodeURIComponent(endpoint)}&apiKey=${encodeURIComponent(currentApiKey)}`,
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `API error: ${response.status}`)
        }

        console.log("Search results:", data)

        // Normalize the response structure for consistency
        const normalizedData = data

        // If this is a DOT number search with content.carrier structure
        if (data.content && data.content.carrier && !Array.isArray(data.content)) {
          console.log("Normalizing DOT number search response")
          // No need to modify the data, the component will handle this structure
        }

        // Check which carriers already exist in the database
        if (Array.isArray(normalizedData.content) && normalizedData.content.length > 0) {
          await checkExistingCarriers(normalizedData.content)
        }

        setResults(normalizedData)

        // Save the carrier data to the database
        if (normalizedData && normalizedData.content) {
          setIsSaving(true)

          if (Array.isArray(normalizedData.content)) {
            // For large result sets, process in batches
            const carriers = normalizedData.content
            setTotalToProcess(carriers.length)

            // Start batch processing
            processBatch(carriers, 0)
          } else {
            // Save the single carrier
            setTotalToProcess(1)
            await saveCarrierToDatabase(normalizedData)
            setProcessingProgress(1)
            setIsSaving(false)
            setIsSaved(true)
          }
        }

        return normalizedData
      } catch (err: any) {
        console.error("Error searching carrier:", err)
        setError(err.message || "Failed to search carrier")
        setIsSaving(false)
        return null
      } finally {
        setLoading(false)
      }
    },
    [refreshApiKey, checkExistingCarriers, saveCarrierToDatabase, processBatch],
  )

  const getCarrierDetails = useCallback(
    async ({ type, dotNumber }: CarrierDetailRequest) => {
      // Refresh the API key before fetching details
      await refreshApiKey()

      // Get the API key directly from localStorage to ensure it's the most current
      const currentApiKey = localStorage.getItem("fmcsa-api-key")

      if (!currentApiKey) {
        setError("FMCSA API key is not configured. Please add your API key in the settings.")
        return null
      }

      setLoading(true)
      setError(null)

      try {
        // Construct the endpoint URL correctly
        const endpoint = `/carriers/${dotNumber}/${type}`

        console.log(`Getting details with endpoint: ${endpoint}`)

        const response = await fetch(
          `/api/carrier-lookup?endpoint=${encodeURIComponent(endpoint)}&apiKey=${encodeURIComponent(currentApiKey)}`,
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `API error: ${response.status}`)
        }

        console.log(`${type} details:`, data)

        // Log the links if they exist
        if (data._links) {
          console.log(`${type} links:`, data._links)
        }

        return data
      } catch (err: any) {
        console.error(`Error fetching carrier ${type}:`, err)
        setError(err.message || `Failed to fetch carrier ${type}`)
        return null
      } finally {
        setLoading(false)
      }
    },
    [refreshApiKey],
  )

  // Update the return value to include the new state variables and functions
  return {
    loading,
    error,
    results,
    searchCarrier,
    getCarrierDetails,
    apiKey,
    refreshApiKey,
    useDbKey,
    isSaving,
    isSaved,
    saveError,
    saveCarrierToDatabase,
    processingProgress,
    totalToProcess,
    existingCarriers,
    isCheckingExisting,
    fetchDocketNumbers,
    cancelProcessing,
  }
}
