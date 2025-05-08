export type QuoteStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Expired"

// Update the QuoteOption type to match the updated database schema
export type QuoteOption = {
  id: string
  quote_id?: string
  name: string
  description?: string
  pickup_date?: string
  delivery_date?: string
  total_rate: number
  transit_time?: string
  is_recommended?: boolean
  notes?: string
  status: QuoteStatus
  carrier?: string
  distance?: number
  weight?: number
  equipment_type?: string
  co2_emissions?: number
  trees_needed?: number
  fuel_cost?: number
  driver_pay?: number
  equipment_maintenance?: number
  overhead_cost?: number
  insurance_cost?: number
  overheads_servicecost?: number
  overhead_and_servicecost?: number // New combined field
  maintance_and_insurance?: number // New combined field
  features?: string
  created_at: string
  updated_at?: string
  truckmpg?: number | string // Handle potential string values from DB
  driverratepermile?: number
  estfuel_needed?: number // Updated field name from Est_fuel_needed to estfuel_needed
  costperliter?: number
  carbon_offsetneeded?: number
  showcost_trasnperency?: string // Include the field with typo
}

// Update the NewQuoteOption type to match
export type NewQuoteOption = Omit<QuoteOption, "id" | "status" | "created_at" | "updated_at">

// Updated to match Supabase table structure
export type Quote = {
  id: string
  reference?: string
  origin: string
  destination: string
  date: string
  status: string
  client_id?: string
  customerName?: string // For UI display purposes
  customerEmail?: string // Added for email functionality
  customerContact?: string // Added for email functionality
  options?: QuoteOption[] // For UI display purposes
  created_at?: string
  updated_at?: string
  sent_email?: string
  sent_email_at?: string
}

// Updated to match Supabase table structure
export type NewQuote = Omit<Quote, "id" | "created_at" | "updated_at" | "status">

export type QuoteSortField = keyof Quote
export type SortDirection = "asc" | "desc"

export type QuoteFilters = {
  searchTerm: string
  status?: QuoteStatus | "all"
  dateRange: {
    from?: Date
    to?: Date
  }
}
