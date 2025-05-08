"use client"

import { useState, useCallback } from "react"
import { supabase } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export interface CarrierLookupResult {
  id: string
  dot_number: string | null
  mc_mx_ff_number: string | null
  legal_name: string | null
  dba_name: string | null
  entity_type: string | null
  carrier_operation: string | null
  cargo_carried: string[] | null
  physical_address: any | null
  mailing_address: any | null
  phone: string | null
  email: string | null
  insurance_required: boolean | null
  insurance_on_file: any | null
  bipd_insurance_required: boolean | null
  bipd_insurance_on_file: any | null
  cargo_insurance_required: boolean | null
  cargo_insurance_on_file: any | null
  safety_rating: string | null
  out_of_service_date: string | null
  operating_status: string | null
  fleet_size: number | null
  driver_count: number | null
  lookup_date: string | null
  created_at: string | null
  updated_at: string | null
  is_saved: boolean | null
  is_favorite: boolean | null
  notes: string | null
  raw_response: any | null
}

export interface CarrierLookupFilters {
  searchTerm?: string
  isFavorite?: boolean
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
  operatingStatus?: string
}

export function useCarrierLookupResults() {
  const [results, setResults] = useState<CarrierLookupResult[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const fetchCarrierLookupResults = useCallback(
    async (filters: CarrierLookupFilters = {}) => {
      try {
        setLoading(true)

        // Build the query
        let query = supabase.from("carrier_lookup_results").select("*", { count: "exact" })

        // Apply filters
        if (filters.searchTerm) {
          const searchTerms = filters.searchTerm.trim().split(/\s+/).filter(Boolean)

          if (searchTerms.length > 0) {
            const searchConditions = []

            for (const term of searchTerms) {
              searchConditions.push(
                `legal_name.ilike.%${term}%`,
                `dba_name.ilike.%${term}%`,
                `dot_number.ilike.%${term}%`,
                `mc_mx_ff_number.ilike.%${term}%`,
              )
            }

            query = query.or(searchConditions.join(","))
          }
        }

        if (filters.isFavorite !== undefined) {
          query = query.eq("is_favorite", filters.isFavorite)
        }

        if (filters.operatingStatus) {
          query = query.eq("operating_status", filters.operatingStatus)
        }

        if (filters.startDate) {
          query = query.gte("created_at", filters.startDate)
        }

        if (filters.endDate) {
          query = query.lte("created_at", filters.endDate)
        }

        // Add pagination
        if (filters.limit) {
          query = query.limit(filters.limit)
        } else {
          query = query.limit(50) // Default limit
        }

        if (filters.offset) {
          query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
        }

        // Order by created_at
        query = query.order("created_at", { ascending: false })

        // Execute the query
        const { data, error, count } = await query

        if (error) {
          throw error
        }

        // Process the data to ensure all fields are properly formatted
        const processedData =
          data?.map((carrier) => ({
            ...carrier,
            // Ensure boolean fields are actually booleans
            is_saved: carrier.is_saved === true,
            is_favorite: carrier.is_favorite === true,
            // Parse JSON fields if they're strings
            physical_address:
              typeof carrier.physical_address === "string"
                ? JSON.parse(carrier.physical_address)
                : carrier.physical_address,
            mailing_address:
              typeof carrier.mailing_address === "string"
                ? JSON.parse(carrier.mailing_address)
                : carrier.mailing_address,
          })) || []

        setResults(processedData)
        setTotalCount(count || 0)

        return { data: processedData, count }
      } catch (error) {
        console.error("Error fetching carrier lookup results:", error)
        toast({
          title: "Error",
          description: "Failed to fetch carrier lookup results. Please try again.",
          variant: "destructive",
        })
        return { data: [], count: 0 }
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const toggleFavorite = useCallback(
    async (id: string, isFavorite: boolean) => {
      try {
        setActionInProgress(id)

        const { error } = await supabase
          .from("carrier_lookup_results")
          .update({
            is_favorite: isFavorite,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)

        if (error) {
          throw error
        }

        // Update local state
        setResults((prev) =>
          prev.map((result) =>
            result.id === id ? { ...result, is_favorite: isFavorite, updated_at: new Date().toISOString() } : result,
          ),
        )

        toast({
          title: isFavorite ? "Added to favorites" : "Removed from favorites",
          description: `Carrier has been ${isFavorite ? "added to" : "removed from"} favorites`,
        })

        return true
      } catch (error) {
        console.error("Error toggling favorite status:", error)
        toast({
          title: "Error",
          description: "Failed to update favorite status. Please try again.",
          variant: "destructive",
        })
        return false
      } finally {
        setActionInProgress(null)
      }
    },
    [toast],
  )

  const viewCarrierDetails = useCallback(
    (dotNumber: string | null) => {
      if (!dotNumber) {
        toast({
          title: "Error",
          description: "Cannot view details: DOT number is missing",
          variant: "destructive",
        })
        return
      }

      // Navigate to the carrier lookup page with the DOT number
      router.push(`/dashboard/carrier-lookup?dot=${dotNumber}`)
    },
    [router, toast],
  )

  return {
    results,
    loading,
    totalCount,
    actionInProgress,
    fetchCarrierLookupResults,
    toggleFavorite,
    viewCarrierDetails,
  }
}
