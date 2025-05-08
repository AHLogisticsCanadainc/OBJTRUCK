export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      admin_signins: {
        Row: {
          admin_id: string | null
          id: string
          ip_address: string
          signed_in_at: string | null
        }
        Insert: {
          admin_id?: string | null
          id?: string
          ip_address: string
          signed_in_at?: string | null
        }
        Update: {
          admin_id?: string | null
          id?: string
          ip_address?: string
          signed_in_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_signins_admin_id_fkey"
            columns: ["admin_id"]
            referencedTable: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      carriers: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          dot_number: string | null
          id: string
          mc_number: string | null
          name: string
          notes: string | null
          status: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          dot_number?: string | null
          id?: string
          mc_number?: string | null
          name: string
          notes?: string | null
          status?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          dot_number?: string | null
          id?: string
          mc_number?: string | null
          name?: string
          notes?: string | null
          status?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address_city: string | null
          address_number: string | null
          address_state_province: string | null
          address_street: string | null
          address_suite: string | null
          address_zip_postal: string | null
          billing_address: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          credit_limit: number | null
          id: string
          name: string
          notes: string | null
          payment_terms: string | null
          status: string | null
          updated_at: string | null
          Portalcreated: string | null
          portalactivated: string | null
          signup_email: string | null
        }
        Insert: {
          address_city?: string | null
          address_number?: string | null
          address_state_province?: string | null
          address_street?: string | null
          address_suite?: string | null
          address_zip_postal?: string | null
          billing_address?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          credit_limit?: number | null
          id?: string
          name: string
          notes?: string | null
          payment_terms?: string | null
          status?: string | null
          updated_at?: string | null
          Portalcreated?: string | null
          portalactivated?: string | null
          signup_email?: string | null
        }
        Update: {
          address_city?: string | null
          address_number?: string | null
          address_state_province?: string | null
          address_street?: string | null
          address_suite?: string | null
          address_zip_postal?: string | null
          billing_address?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          credit_limit?: number | null
          id?: string
          name?: string
          notes?: string | null
          payment_terms?: string | null
          status?: string | null
          updated_at?: string | null
          Portalcreated?: string | null
          portalactivated?: string | null
          signup_email?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          document_name: string | null
          document_type: string | null
          document_url: string | null
          id: string
          load_id: string | null
          upload_date: string | null
          uploaded_by: string | null
        }
        Insert: {
          document_name?: string | null
          document_type?: string | null
          document_url?: string | null
          id?: string
          load_id?: string | null
          upload_date?: string | null
          uploaded_by?: string | null
        }
        Update: {
          document_name?: string | null
          document_type?: string | null
          document_url?: string | null
          id?: string
          load_id?: string | null
          upload_date?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_load_id_fkey"
            columns: ["load_id"]
            referencedTable: "loads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            referencedTable: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      loads: {
        Row: {
          carrier_id: string | null
          carrier_rate: number | null
          commodity: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          delivery_date: string | null
          delivery_location: string | null
          id: string
          notes: string | null
          pickup_date: string | null
          pickup_location: string | null
          rate: number | null
          reference_number: string | null
          status: string
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          carrier_id?: string | null
          carrier_rate?: number | null
          commodity?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          delivery_date?: string | null
          delivery_location?: string | null
          id?: string
          notes?: string | null
          pickup_date?: string | null
          pickup_location?: string | null
          rate?: number | null
          reference_number?: string | null
          status: string
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          carrier_id?: string | null
          carrier_rate?: number | null
          commodity?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          delivery_date?: string | null
          delivery_location?: string | null
          id?: string
          notes?: string | null
          pickup_date?: string | null
          pickup_location?: string | null
          rate?: number | null
          reference_number?: string | null
          status?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loads_carrier_id_fkey"
            columns: ["carrier_id"]
            referencedTable: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loads_created_by_fkey"
            columns: ["created_by"]
            referencedTable: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_options: {
        Row: {
          carbon_offsetneeded: number | null
          costperliter: number | null
          created_at: string | null
          delivery_date: string | null
          description: string | null
          distance: number | null
          driver_pay: number | null
          driverratepermile: number | null
          equipment_maintenance: number | null
          equipment_type: string | null
          estfuel_needed: number | null
          features: string | null
          fuel_cost: number | null
          id: string
          insurance_cost: number | null
          is_recommended: boolean | null
          maintance_and_insurance: number | null
          name: string
          notes: string | null
          overhead_and_servicecost: number | null
          overhead_cost: number | null
          overheads_servicecost: number | null
          pickup_date: string | null
          quote_id: string | null
          showcost_trasnperency: string | null
          status: string | null
          total_rate: number
          transit_time: string | null
          truckmpg: number | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          carbon_offsetneeded?: number | null
          costperliter?: number | null
          created_at?: string | null
          delivery_date?: string | null
          description?: string | null
          distance?: number | null
          driver_pay?: number | null
          driverratepermile?: number | null
          equipment_maintenance?: number | null
          equipment_type?: string | null
          estfuel_needed?: number | null
          features?: string | null
          fuel_cost?: number | null
          id?: string
          insurance_cost?: number | null
          is_recommended?: boolean | null
          maintance_and_insurance?: number | null
          name: string
          notes?: string | null
          overhead_and_servicecost?: number | null
          overhead_cost?: number | null
          overheads_servicecost?: number | null
          pickup_date?: string | null
          quote_id?: string | null
          showcost_trasnperency?: string | null
          status?: string | null
          total_rate: number
          transit_time?: string | null
          truckmpg?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          carbon_offsetneeded?: number | null
          costperliter?: number | null
          created_at?: string | null
          delivery_date?: string | null
          description?: string | null
          distance?: number | null
          driver_pay?: number | null
          driverratepermile?: number | null
          equipment_maintenance?: number | null
          equipment_type?: string | null
          estfuel_needed?: number | null
          features?: string | null
          fuel_cost?: number | null
          id?: string
          insurance_cost?: number | null
          is_recommended?: boolean | null
          maintance_and_insurance?: number | null
          name?: string
          notes?: string | null
          overhead_and_servicecost?: number | null
          overhead_cost?: number | null
          overheads_servicecost?: number | null
          pickup_date?: string | null
          quote_id?: string | null
          showcost_trasnperency?: string | null
          status?: string | null
          total_rate?: number
          transit_time?: string | null
          truckmpg?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_options_quote_id_fkey"
            columns: ["quote_id"]
            referencedTable: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string | null
          date: string | null
          destination: string | null
          id: string
          origin: string | null
          reference: string | null
          sent_email: string | null
          sent_email_at: string | null
          status: string | null
          updated_at: string | null
          client_id: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          destination: string | null
          id?: string
          origin?: string | null
          reference?: string | null
          sent_email?: string | null
          sent_email_at?: string | null
          status?: string | null
          updated_at?: string | null
          client_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          destination?: string | null
          id?: string
          origin?: string | null
          reference?: string | null
          sent_email?: string | null
          sent_email_at?: string | null
          status?: string | null
          updated_at?: string | null
          client_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            referencedTable: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      unauthorized_signins: {
        Row: {
          attempted_at: string | null
          email: string
          id: string
          ip_address: string
        }
        Insert: {
          attempted_at?: string | null
          email: string
          id?: string
          ip_address: string
        }
        Update: {
          attempted_at?: string | null
          email?: string
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            referencedTable: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_column_if_not_exists: {
        Args: {
          table_name: string
          column_name: string
          column_type: string
        }
        Returns: undefined
      }
      check_column_exists: {
        Args: {
          table_name: string
          column_name: string
        }
        Returns: boolean
      }
      get_server_version: {
        Args: {}
        Returns: string
      }
      get_table_info: {
        Args: {
          table_name: string
        }
        Returns: Json
      }
      log_admin_signin: {
        Args: {
          p_email: string
          p_ip: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
