-- Create carrier_lookup_results table if it doesn't exist
CREATE TABLE IF NOT EXISTS carrier_lookup_results (
  id SERIAL PRIMARY KEY,
  dot_number TEXT UNIQUE,
  mc_mx_ff_number TEXT,
  legal_name TEXT,
  dba_name TEXT,
  entity_type TEXT,
  carrier_operation TEXT,
  cargo_carried JSONB,
  physical_address JSONB,
  mailing_address JSONB,
  phone TEXT,
  email TEXT,
  insurance_required BOOLEAN,
  insurance_on_file JSONB,
  bipd_insurance_required BOOLEAN,
  bipd_insurance_on_file JSONB,
  cargo_insurance_required BOOLEAN,
  cargo_insurance_on_file JSONB,
  safety_rating TEXT,
  out_of_service_date TIMESTAMP,
  operating_status TEXT,
  fleet_size INTEGER,
  driver_count INTEGER,
  raw_response JSONB,
  data_source TEXT,
  is_saved BOOLEAN DEFAULT TRUE,
  lookup_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on dot_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_carrier_lookup_results_dot_number ON carrier_lookup_results(dot_number);

-- Create index on legal_name for faster text searches
CREATE INDEX IF NOT EXISTS idx_carrier_lookup_results_legal_name ON carrier_lookup_results USING gin(legal_name gin_trgm_ops);

-- Create index on lookup_date for sorting by most recent
CREATE INDEX IF NOT EXISTS idx_carrier_lookup_results_lookup_date ON carrier_lookup_results(lookup_date DESC);
