"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/database"
import type { QuoteOption, NewQuoteOption } from "@/types/quotes"

export function useQuoteOptions(quoteId?: string) {
  const [options, setOptions] = useState<QuoteOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use a ref to track if we've already fetched options for this quote
  const fetchedRef = useRef<Record<string, boolean>>({})

  // Fetch options for a specific quote
  const fetchOptions = useCallback(async (id: string) => {
    // Skip if we've already fetched options for this quote and have them in state
    if (fetchedRef.current[id] && options.length > 0) {
      console.log(`Using cached options for quote ${id}`)
      return options
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log(`Fetching options for quote ${id}`)

      // Use the correct table name and column names
      const { data, error: fetchError } = await supabase
        .from("quote_options")
        .select("*")
        .eq("quote_id", id)
        .order("created_at", { ascending: false })

      if (fetchError) {
        console.error("Error fetching quote options:", fetchError)
        throw new Error(`Failed to fetch options: ${fetchError.message}`)
      }

      console.log(`Successfully fetched ${data?.length || 0} options`)

      // Mark this quote as having been fetched
      fetchedRef.current[id] = true

      // Transform data to match our QuoteOption type
      // Handle fields with special characters or quotes
      const transformedOptions = data.map((option) => ({
        ...option,
        // Ensure estfuel_needed is properly accessed (updated field name)
        estfuel_needed: option.estfuel_needed,
        // Handle any other fields with special characters
        overheads_servicecost: option.overheads_servicecost || null,
      }))

      setOptions(transformedOptions)
      return transformedOptions
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error fetching options"
      console.error("Error in fetchOptions:", errorMessage)
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch options when quoteId changes
  useEffect(() => {
    if (quoteId) {
      fetchOptions(quoteId)
    }
  }, [quoteId, fetchOptions])

  // Update the createOption function to ensure combined costs are properly handled
  // Update the createOption function to include better error handling and debugging

  const createOption = async (newOption: NewQuoteOption) => {
    if (!quoteId) {
      console.error("Cannot create option: No quote ID provided")
      setError("Cannot create option: No quote ID provided")
      return null
    }

    try {
      setIsLoading(true)
      setError(null)

      // Log the full option data for debugging
      console.log("Creating new option with full data:", newOption)
      console.log("For quote ID:", quoteId)

      // Ensure combined costs are calculated
      const overhead_and_servicecost =
        newOption.overhead_cost !== undefined && newOption.overheads_servicecost !== undefined
          ? Number((newOption.overhead_cost + newOption.overheads_servicecost).toFixed(2))
          : undefined

      const maintance_and_insurance =
        newOption.equipment_maintenance !== undefined && newOption.insurance_cost !== undefined
          ? Number((newOption.equipment_maintenance + newOption.insurance_cost).toFixed(2))
          : undefined

      // Prepare the option data for Supabase
      const optionData = {
        ...newOption,
        quote_id: quoteId,
        // Ensure estfuel_needed is properly set (updated field name)
        estfuel_needed: newOption.estfuel_needed,
        // Use the exact column name for overheads_servicecost
        overheads_servicecost: newOption.overheads_servicecost,
        // Add the combined costs
        overhead_and_servicecost,
        maintance_and_insurance,
        // Ensure status is set if not provided
        status: newOption.status || "pending",
      }

      console.log("Sending to Supabase:", optionData)

      // Use upsert instead of insert to handle both create and update scenarios
      const { data, error: insertError } = await supabase.from("quote_options").insert([optionData]).select()

      if (insertError) {
        console.error("Supabase error creating option:", insertError)
        throw new Error(`Failed to create option: ${insertError.message}`)
      }

      if (!data || data.length === 0) {
        console.error("No data returned from option creation")
        throw new Error("No data returned from option creation")
      }

      console.log("Successfully created option, received data:", data[0])

      // Transform the returned data to match our QuoteOption type
      const newCreatedOption: QuoteOption = {
        ...data[0],
        // Ensure estfuel_needed is properly accessed (updated field name)
        estfuel_needed: data[0].estfuel_needed,
        // Map the column with underscores to our normalized property name
        overheads_servicecost: data[0].overheads_servicecost,
        overhead_and_servicecost: data[0].overhead_and_servicecost,
        maintance_and_insurance: data[0].maintance_and_insurance,
      }

      // Update the local state
      setOptions((prevOptions) => [newCreatedOption, ...prevOptions])

      // Clear the fetchedRef for this quoteId to force a refresh
      fetchedRef.current[quoteId] = false

      return newCreatedOption
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error("Error creating option:", errorMessage)
      setError(`Failed to create option: ${errorMessage}`)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Update the updateOption function to ensure combined costs are properly handled
  // Also update the updateOption function with similar improvements

  const updateOption = async (optionId: string, updatedData: Partial<QuoteOption>) => {
    try {
      setIsLoading(true)
      setError(null)

      // Prepare the data for Supabase
      const updateData = { ...updatedData }

      // Add updated_at timestamp
      updateData.updated_at = new Date().toISOString()

      // Calculate combined costs if the component values are being updated
      if (
        (updateData.overhead_cost !== undefined || updateData.overheads_servicecost !== undefined) &&
        options.length > 0
      ) {
        // Find the current option to get the current values
        const currentOption = options.find((opt) => opt.id === optionId)
        if (currentOption) {
          // Use the updated values or fall back to the current values
          const overhead =
            updateData.overhead_cost !== undefined ? updateData.overhead_cost : currentOption.overhead_cost
          const service =
            updateData.overheads_servicecost !== undefined
              ? updateData.overheads_servicecost
              : currentOption.overheads_servicecost

          // Calculate the combined value if both components are available
          if (overhead !== undefined && service !== undefined) {
            updateData.overhead_and_servicecost = Number((overhead + service).toFixed(2))
          }
        }
      }

      // Calculate maintenance and insurance combined cost if the component values are being updated
      if (
        (updateData.equipment_maintenance !== undefined || updateData.insurance_cost !== undefined) &&
        options.length > 0
      ) {
        // Find the current option to get the current values
        const currentOption = options.find((opt) => opt.id === optionId)
        if (currentOption) {
          // Use the updated values or fall back to the current values
          const maintenance =
            updateData.equipment_maintenance !== undefined
              ? updateData.equipment_maintenance
              : currentOption.equipment_maintenance
          const insurance =
            updateData.insurance_cost !== undefined ? updateData.insurance_cost : currentOption.insurance_cost

          // Calculate the combined value if both components are available
          if (maintenance !== undefined && insurance !== undefined) {
            updateData.maintance_and_insurance = Number((maintenance + insurance).toFixed(2))
          }
        }
      }

      console.log(`Updating option ${optionId}:`, updateData)

      const { data, error: updateError } = await supabase
        .from("quote_options")
        .update(updateData)
        .eq("id", optionId)
        .select()

      if (updateError) {
        console.error("Error updating option:", updateError)
        throw new Error(`Failed to update option: ${updateError.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error("No data returned from option update")
      }

      console.log("Successfully updated option:", data[0])

      // Transform the returned data to match our QuoteOption type
      const updatedOption: QuoteOption = {
        ...data[0],
        // Map the column with underscores to our normalized property name
        overheads_servicecost: data[0].overheads_servicecost,
        overhead_and_servicecost: data[0].overhead_and_servicecost,
        maintance_and_insurance: data[0].maintance_and_insurance,
      }

      // Update the local state
      setOptions((prevOptions) => prevOptions.map((option) => (option.id === optionId ? updatedOption : option)))

      return updatedOption
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error("Error updating option:", errorMessage)
      setError(`Failed to update option: ${errorMessage}`)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Delete an option
  const deleteOption = async (optionId: string) => {
    if (!optionId) {
      console.error("Cannot delete option: No option ID provided")
      return false
    }

    try {
      setIsLoading(true)

      console.log(`Deleting option ${optionId}`)

      const { error: deleteError } = await supabase.from("quote_options").delete().eq("id", optionId)

      if (deleteError) {
        console.error("Error deleting option:", deleteError)
        throw new Error(`Failed to delete option: ${deleteError.message}`)
      }

      console.log(`Successfully deleted option ${optionId}`)

      // Update the local state
      setOptions((prevOptions) => prevOptions.filter((option) => option.id !== optionId))

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error("Error deleting option:", errorMessage)
      setError(`Failed to delete option: ${errorMessage}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Update the duplicateOption function to ensure combined costs are properly calculated
  // Update the duplicateOption function with better error handling and debugging
  const duplicateOption = async (option: QuoteOption) => {
    if (!quoteId) {
      console.error("Cannot duplicate option: No quote ID provided")
      setError("Cannot duplicate option: No quote ID provided")
      return null // Return null immediately instead of setting loading state
    }

    if (!option || !option.id) {
      console.error("Cannot duplicate option: Invalid option provided")
      setError("Cannot duplicate option: Invalid option provided")
      return null // Return null immediately instead of setting loading state
    }

    try {
      setIsLoading(true)
      console.log(`Starting duplication of option ${option.id}`, option)

      // Simplify the duplication process to avoid potential issues
      // Create a clean object with only the essential fields
      const duplicateData = {
        name: `${option.name} (Copy)`,
        description: option.description || "",
        equipment_type: option.equipment_type || "",
        transit_time: option.transit_time || "",
        total_rate: option.total_rate ? Number(option.total_rate) : 0,
        weight: option.weight ? Number(option.weight) : 0,
        carrier: option.carrier || "",
        notes: option.notes || "",
        is_recommended: false, // Default to not recommended for the copy
        pickup_date: option.pickup_date || null,
        delivery_date: option.delivery_date || null,
        distance: option.distance ? Number(option.distance) : 0,
        co2_emissions: option.co2_emissions ? Number(option.co2_emissions) : 0,
        trees_needed: option.trees_needed ? Number(option.trees_needed) : 0,
        fuel_cost: option.fuel_cost ? Number(option.fuel_cost) : 0,
        driver_pay: option.driver_pay ? Number(option.driver_pay) : 0,
        features: option.features || "",
        truckmpg: option.truckmpg ? Number(option.truckmpg) : 0,
        driverratepermile: option.driverratepermile ? Number(option.driverratepermile) : 0,
        estfuel_needed: option.estfuel_needed ? Number(option.estfuel_needed) : 0,
        costperliter: option.costperliter ? Number(option.costperliter) : 0,
        carbon_offsetneeded: option.carbon_offsetneeded ? Number(option.carbon_offsetneeded) : 0,
        status: "pending", // Default to pending for the copy
        quote_id: quoteId, // Ensure it's linked to the current quote
        // Add the combined fields directly
        equipment_maintenance: option.equipment_maintenance,
        insurance_cost: option.insurance_cost,
        overhead_cost: option.overhead_cost,
        overheads_servicecost: option.overheads_servicecost,
      }

      // Log the data being sent to Supabase
      console.log("Duplicating option with data:", duplicateData)

      // Insert the new option
      const { data, error: insertError } = await supabase.from("quote_options").insert([duplicateData]).select()

      if (insertError) {
        console.error("Error duplicating option:", insertError)
        throw new Error(`Failed to duplicate option: ${insertError.message}`)
      }

      if (!data || data.length === 0) {
        console.error("No data returned from option duplication")
        throw new Error("No data returned from option duplication")
      }

      console.log("Successfully duplicated option:", data[0])

      // Create a new option object with the returned data
      const newOption: QuoteOption = {
        ...data[0],
        // Ensure status is set correctly
        status: data[0].status || "pending",
      }

      // Update the local state
      setOptions((prevOptions) => [newOption, ...prevOptions])

      return newOption
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error("Error duplicating option:", errorMessage)
      setError(`Failed to duplicate option: ${errorMessage}`)
      return null
    } finally {
      // Always reset loading state
      setIsLoading(false)
    }
  }

  // Clear options (useful when changing quotes)
  const clearOptions = useCallback(() => {
    setOptions([])
  }, [])

  // Refresh options (force a new fetch)
  const refreshOptions = useCallback(async () => {
    if (quoteId) {
      // Remove from cache so it will re-fetch
      fetchedRef.current[quoteId] = false
      return await fetchOptions(quoteId)
    }
    return []
  }, [quoteId, fetchOptions])

  return {
    options,
    isLoading,
    error,
    fetchOptions,
    createOption,
    updateOption,
    deleteOption,
    duplicateOption,
    clearOptions,
    refreshOptions,
  }
}
