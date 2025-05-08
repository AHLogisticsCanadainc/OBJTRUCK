"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  searchLocations,
  getLocationsByClient,
  getLocationsByType,
} from "@/lib/location-service"
import type { Location, LocationFormData } from "@/types/location"

export function useLocations(initialClientId?: string, initialLocationType?: string) {
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch locations based on filters
  const fetchLocations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let result

      if (initialClientId) {
        result = await getLocationsByClient(initialClientId)
      } else if (initialLocationType) {
        result = await getLocationsByType(initialLocationType)
      } else {
        result = await getLocations()
      }

      if (result.error) {
        throw new Error(result.error.message)
      }

      setLocations(result.data)
    } catch (err) {
      console.error("Error fetching locations:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch locations"))
    } finally {
      setIsLoading(false)
    }
  }, [initialClientId, initialLocationType])

  // Add a new location
  const addNewLocation = useCallback(async (data: LocationFormData) => {
    try {
      const result = await addLocation(data)

      if (result.error) {
        throw new Error(result.error.message)
      }

      if (result.data) {
        setLocations((prev) => [...prev, result.data])
      }

      return result.data
    } catch (err) {
      console.error("Error adding location:", err)
      throw err
    }
  }, [])

  // Update an existing location
  const updateExistingLocation = useCallback(
    async (id: string, data: LocationFormData) => {
      try {
        // Make sure we don't allow editing of client-added fields
        const existingLocation = locations.find((location) => location.id === id)

        const updatedLocation = {
          ...data,
          wasItClientAdded: existingLocation?.wasItClientAdded || null,
          ifClientAddedThenWhichClientid: existingLocation?.ifClientAddedThenWhichClientid || null,
          nameOfTheClient: existingLocation?.nameOfTheClient || null,
        }

        const result = await updateLocation(id, updatedLocation)

        if (result.error) {
          throw new Error(result.error.message)
        }

        if (result.data) {
          setLocations((prev) => prev.map((location) => (location.id === id ? result.data : location)))
        }

        return result.data
      } catch (err) {
        console.error("Error updating location:", err)
        throw err
      }
    },
    [locations],
  )

  // Delete a location
  const deleteExistingLocation = useCallback(async (id: string) => {
    try {
      const result = await deleteLocation(id)

      if (result.error) {
        throw new Error(result.error.message)
      }

      if (result.success) {
        setLocations((prev) => prev.filter((location) => location.id !== id))
      }

      return result.success
    } catch (err) {
      console.error("Error deleting location:", err)
      throw err
    }
  }, [])

  // Search locations
  const searchForLocations = useCallback(async (query: string) => {
    try {
      const result = await searchLocations(query)

      if (result.error) {
        throw new Error(result.error.message)
      }

      return result.data
    } catch (err) {
      console.error("Error searching locations:", err)
      throw err
    }
  }, [])

  // Load locations on component mount
  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  return {
    locations,
    isLoading,
    error,
    addLocation: addNewLocation,
    updateLocation: updateExistingLocation,
    deleteLocation: deleteExistingLocation,
    searchLocations: searchForLocations,
    refreshLocations: fetchLocations,
  }
}
