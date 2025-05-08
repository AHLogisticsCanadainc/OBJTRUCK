export interface Carrier {
  id: number
  company_name: string
  email: string | null
  mc_number: string | null
  usdot: string | null
  address_number: string | null
  address_street: string | null
  address_suite: string | null
  address_city: string | null
  address_state_or_province: string | null
  address_zip_or_postal: string | null
  yard_address_number: string | null
  yard_address_street: string | null
  yard_address_suite: string | null
  yard_address_city: string | null
  yard_address_state_or_province: string | null
  yard_address_zip_or_postal: string | null
  tractor_units: number | null
  trailer_units: number | null
  payment_terms: string | null
  dba_name: string | null
  dispatch_email: string | null
  dispatch_email_contact_person: string | null
  sales_email: string | null
  owner_email: string | null
  eta_email: string | null
  safety_email: string | null
  notes: string | null
  main_contact_name: string
  main_contact_phone: string
  main_contact_email: string
  source: string | null
  active: boolean
  created_at: string | null
  updated_at: string | null
  carrier_portalactive: string | null
  carrier_portalsignup_email: string | null
  carrier_portal_activedate: string | null
}

export interface NewCarrier extends Omit<Carrier, "id" | "created_at" | "updated_at"> {
  id?: number
}

export interface CarrierFilters {
  searchTerm?: string
  active?: boolean
}
