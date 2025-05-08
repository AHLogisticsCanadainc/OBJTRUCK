export interface Client {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone_number?: string
  address_number?: string
  address_street?: string
  address_suite?: string
  address_city?: string
  address_state_province?: string
  address_zip_postal?: string
  payment_terms?: string
  credit_limit?: number
  notes?: string
  active?: boolean
  created_at?: string
  updated_at?: string
  Portalcreated?: string
  portalactivated?: string
  signup_email?: string
}
