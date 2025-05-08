import { supabase } from "./database"
import type { Carrier, NewCarrier, CarrierFilters } from "@/types/carrier-types"

export async function getCarriers(filters?: CarrierFilters) {
  let query = supabase.from("carriers").select("*").order("company_name")

  // Apply filters if provided
  if (filters) {
    if (filters.searchTerm) {
      query = query.or(
        `company_name.ilike.%${filters.searchTerm}%,mc_number.ilike.%${filters.searchTerm}%,usdot.ilike.%${filters.searchTerm}%`,
      )
    }

    if (filters.active !== undefined) {
      query = query.eq("active", filters.active)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching carriers:", error)
    throw error
  }

  return data as Carrier[]
}

export async function getCarrierById(id: number) {
  const { data, error } = await supabase.from("carriers").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching carrier with ID ${id}:`, error)
    throw error
  }

  return data as Carrier
}

export async function createCarrier(carrier: NewCarrier) {
  const { data, error } = await supabase.from("carriers").insert(carrier).select().single()

  if (error) {
    console.error("Error creating carrier:", error)
    throw error
  }

  return data as Carrier
}

export async function updateCarrier(id: number, updates: Partial<Carrier>) {
  const { data, error } = await supabase.from("carriers").update(updates).eq("id", id).select().single()

  if (error) {
    console.error(`Error updating carrier with ID ${id}:`, error)
    throw error
  }

  return data as Carrier
}

export async function deleteCarrier(id: number) {
  const { error } = await supabase.from("carriers").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting carrier with ID ${id}:`, error)
    throw error
  }

  return true
}

export async function toggleCarrierStatus(id: number, active: boolean) {
  return updateCarrier(id, { active })
}
