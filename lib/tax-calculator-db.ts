import { supabase } from "./database"
import type { LoadEntry, Client, Carrier, ITCEntry, Vendor } from "@/components/tools/all-tax-calculator/types"

// Tax Calculator Database Tables
export const TAX_TABLES = {
  LOADS: "tax_calc_loads",
  ITC_ENTRIES: "tax_calc_itc_entries",
  CLIENTS: "tax_calc_clients",
  CARRIERS: "tax_calc_carriers",
  PERIODS: "tax_calc_periods",
  VENDORS: "tax_calc_vendors", // New table for vendors
}

// Load functions
export async function getTaxLoads() {
  // Ensure we're using the authenticated client
  if (!supabase) {
    console.error("Supabase client not initialized")
    return { data: [], error: new Error("Database client not initialized") }
  }

  const { data, error } = await supabase.from(TAX_TABLES.LOADS).select("*").order("delivery_date", { ascending: false })

  if (error) {
    console.error("Error fetching tax loads:", error)
    return { data: [], error }
  }

  // Convert database records to LoadEntry objects
  const loads: LoadEntry[] = data.map((load) => ({
    id: load.id,
    loadNumber: load.load_number,
    deliveryDate: new Date(load.delivery_date),
    clientBaseAmount: Number(load.client_base_amount),
    carrierAllInAmount: Number(load.carrier_all_in_amount),
    province: load.province,
    deliveryProvince: load.delivery_province,
    taxRate: Number(load.tax_rate),
    clientId: load.client_id,
    carrierId: load.carrier_id,
    clientHST: Number(load.client_hst),
    clientTotal: Number(load.client_total),
    carrierPreTax: Number(load.carrier_pre_tax),
    carrierHST: Number(load.carrier_hst),
    hstPayable: Number(load.hst_payable),
    profit: Number(load.profit),
  }))

  return { data: loads, error: null }
}

export async function addTaxLoad(load: LoadEntry, userId?: string) {
  // Convert LoadEntry to database record format
  const dbLoad = {
    load_number: load.loadNumber,
    delivery_date: load.deliveryDate.toISOString(),
    client_base_amount: load.clientBaseAmount,
    carrier_all_in_amount: load.carrierAllInAmount,
    province: load.province,
    delivery_province: load.deliveryProvince,
    tax_rate: load.taxRate,
    client_id: load.clientId,
    carrier_id: load.carrierId,
    client_hst: load.clientHST,
    client_total: load.clientTotal,
    carrier_pre_tax: load.carrierPreTax,
    carrier_hst: load.carrierHST,
    hst_payable: load.hstPayable,
    profit: load.profit,
    created_by: userId || null,
  }

  const { data, error } = await supabase.from(TAX_TABLES.LOADS).insert(dbLoad).select("*").single()

  if (error) {
    console.error("Error adding tax load:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

export async function deleteTaxLoad(loadId: string) {
  const { data, error } = await supabase.from(TAX_TABLES.LOADS).delete().eq("id", loadId)

  if (error) {
    console.error("Error deleting tax load:", error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

// ITC functions
export async function getTaxITCs() {
  const { data, error } = await supabase.from(TAX_TABLES.ITC_ENTRIES).select("*").order("date", { ascending: false })

  if (error) {
    console.error("Error fetching tax ITCs:", error)
    return { data: [], error }
  }

  // Convert database records to ITCEntry objects
  const itcs: ITCEntry[] = data.map((itc) => ({
    id: itc.id,
    description: itc.description,
    paidTo: itc.paid_to,
    invoiceDate: itc.invoice_date ? new Date(itc.invoice_date) : undefined,
    hstNumber: itc.hst_number,
    amountBeforeTax: Number(itc.amount_before_tax),
    taxAmount: Number(itc.tax_amount),
    date: new Date(itc.date),
    category: itc.category,
    province: itc.province,
    vendorId: itc.vendor_id, // Added vendorId
  }))

  return { data: itcs, error: null }
}

export async function addTaxITC(itc: ITCEntry, userId?: string) {
  // Convert ITCEntry to database record format
  const dbITC = {
    description: itc.description,
    paid_to: itc.paidTo,
    invoice_date: itc.invoiceDate?.toISOString(),
    hst_number: itc.hstNumber,
    amount_before_tax: itc.amountBeforeTax,
    tax_amount: itc.taxAmount,
    date: itc.date.toISOString(),
    created_by: userId || null,
    category: itc.category,
    province: itc.province,
    vendor_id: itc.vendorId, // Added vendorId
  }

  const { data, error } = await supabase.from(TAX_TABLES.ITC_ENTRIES).insert(dbITC).select("*").single()

  if (error) {
    console.error("Error adding tax ITC:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

export async function deleteTaxITC(itcId: string) {
  const { data, error } = await supabase.from(TAX_TABLES.ITC_ENTRIES).delete().eq("id", itcId)

  if (error) {
    console.error("Error deleting tax ITC:", error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

// Client functions
export async function getTaxClients() {
  const { data, error } = await supabase.from(TAX_TABLES.CLIENTS).select("*").order("name")

  if (error) {
    console.error("Error fetching tax clients:", error)
    return { data: [], error }
  }

  // Convert database records to Client objects
  const clients: Client[] = data.map((client) => ({
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    address: client.address,
    hstNumber: client.hst_number,
    province: client.province,
  }))

  return { data: clients, error: null }
}

export async function addTaxClient(client: Client) {
  // Convert Client to database record format
  const dbClient = {
    id: client.id, // Include ID if provided (UUID will be generated if not)
    name: client.name,
    email: client.email,
    phone: client.phone,
    address: client.address,
    hst_number: client.hstNumber,
    province: client.province,
  }

  const { data, error } = await supabase.from(TAX_TABLES.CLIENTS).insert(dbClient).select("*").single()

  if (error) {
    console.error("Error adding tax client:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

export async function deleteTaxClient(clientId: string) {
  // First check if client is used in any loads
  const { data: loadsData, error: loadsError } = await supabase
    .from(TAX_TABLES.LOADS)
    .select("id")
    .eq("client_id", clientId)
    .limit(1)

  if (loadsError) {
    console.error("Error checking for client usage:", loadsError)
    return { success: false, error: loadsError, reason: "Failed to check if client is in use" }
  }

  if (loadsData && loadsData.length > 0) {
    return {
      success: false,
      error: new Error("Client is in use"),
      reason: "Cannot delete client because it is used in one or more loads",
    }
  }

  // If client is not in use, proceed with deletion
  const { data, error } = await supabase.from(TAX_TABLES.CLIENTS).delete().eq("id", clientId)

  if (error) {
    console.error("Error deleting tax client:", error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

// Carrier functions
export async function getTaxCarriers() {
  const { data, error } = await supabase.from(TAX_TABLES.CARRIERS).select("*").order("name")

  if (error) {
    console.error("Error fetching tax carriers:", error)
    return { data: [], error }
  }

  // Convert database records to Carrier objects
  const carriers: Carrier[] = data.map((carrier) => ({
    id: carrier.id,
    name: carrier.name,
    mcNumber: carrier.mc_number,
    email: carrier.email,
    phone: carrier.phone,
    hstNumber: carrier.hst_number,
    province: carrier.province,
  }))

  return { data: carriers, error: null }
}

export async function addTaxCarrier(carrier: Carrier) {
  // Convert Carrier to database record format
  const dbCarrier = {
    id: carrier.id, // Include ID if provided (UUID will be generated if not)
    name: carrier.name,
    mc_number: carrier.mcNumber,
    email: carrier.email,
    phone: carrier.phone,
    hst_number: carrier.hstNumber,
    province: carrier.province,
  }

  const { data, error } = await supabase.from(TAX_TABLES.CARRIERS).insert(dbCarrier).select("*").single()

  if (error) {
    console.error("Error adding tax carrier:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

export async function deleteTaxCarrier(carrierId: string) {
  // First check if carrier is used in any loads
  const { data: loadsData, error: loadsError } = await supabase
    .from(TAX_TABLES.LOADS)
    .select("id")
    .eq("carrier_id", carrierId)
    .limit(1)

  if (loadsError) {
    console.error("Error checking for carrier usage:", loadsError)
    return { success: false, error: loadsError, reason: "Failed to check if carrier is in use" }
  }

  if (loadsData && loadsData.length > 0) {
    return {
      success: false,
      error: new Error("Carrier is in use"),
      reason: "Cannot delete carrier because it is used in one or more loads",
    }
  }

  // If carrier is not in use, proceed with deletion
  const { data, error } = await supabase.from(TAX_TABLES.CARRIERS).delete().eq("id", carrierId)

  if (error) {
    console.error("Error deleting tax carrier:", error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

// Vendor functions
export async function getTaxVendors() {
  // Ensure we're using the authenticated client
  if (!supabase) {
    console.error("Supabase client not initialized")
    return { data: [], error: new Error("Database client not initialized") }
  }

  const { data, error } = await supabase.from(TAX_TABLES.VENDORS).select("*").order("name")

  if (error) {
    console.error("Error fetching tax vendors:", error)
    return { data: [], error }
  }

  // Convert database records to Vendor objects
  const vendors: Vendor[] = data.map((vendor) => ({
    id: vendor.id,
    name: vendor.name,
    email: vendor.email,
    phone: vendor.phone,
    address: vendor.address,
    hstNumber: vendor.hst_number,
    province: vendor.province,
    category: vendor.category,
  }))

  return { data: vendors, error: null }
}

export async function addTaxVendor(vendor: Vendor, userId?: string) {
  // Convert Vendor to database record format
  const dbVendor = {
    id: vendor.id, // Include ID if provided (UUID will be generated if not)
    name: vendor.name,
    email: vendor.email,
    phone: vendor.phone,
    address: vendor.address,
    hst_number: vendor.hstNumber,
    province: vendor.province,
    category: vendor.category,
    created_by: userId || null, // Add user ID for RLS
  }

  const { data, error } = await supabase.from(TAX_TABLES.VENDORS).insert(dbVendor).select("*").single()

  if (error) {
    console.error("Error adding tax vendor:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

export async function deleteTaxVendor(vendorId: string) {
  // First check if vendor is used in any ITCs
  const { data: itcsData, error: itcsError } = await supabase
    .from(TAX_TABLES.ITC_ENTRIES)
    .select("id")
    .eq("vendor_id", vendorId)
    .limit(1)

  if (itcsError) {
    console.error("Error checking for vendor usage:", itcsError)
    return { success: false, error: itcsError, reason: "Failed to check if vendor is in use" }
  }

  if (itcsData && itcsData.length > 0) {
    return {
      success: false,
      error: new Error("Vendor is in use"),
      reason: "Cannot delete vendor because it is used in one or more ITCs",
    }
  }

  // If vendor is not in use, proceed with deletion
  const { data, error } = await supabase.from(TAX_TABLES.VENDORS).delete().eq("id", vendorId)

  if (error) {
    console.error("Error deleting tax vendor:", error)
    return { success: false, error }
  }

  return { success: true, error: null }
}
