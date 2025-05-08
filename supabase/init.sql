-- Setup user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Setup carriers table
CREATE TABLE IF NOT EXISTS carriers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  mc_number TEXT,
  dot_number TEXT,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Setup loads table
CREATE TABLE IF NOT EXISTS loads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number TEXT,
  status TEXT NOT NULL,
  pickup_date DATE,
  delivery_date DATE,
  pickup_location TEXT,
  delivery_location TEXT,
  carrier_id UUID REFERENCES carriers(id),
  customer_id UUID,
  rate DECIMAL,
  carrier_rate DECIMAL,
  commodity TEXT,
  weight DECIMAL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Setup customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  billing_address TEXT,
  payment_terms TEXT,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Setup documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id UUID REFERENCES loads(id),
  document_type TEXT,
  document_name TEXT,
  document_url TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- 1. Table for authorized admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table for successful admin sign-ins
CREATE TABLE IF NOT EXISTS admin_signins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  signed_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET NOT NULL
);

-- 3. Table for unauthorized sign-in attempts
CREATE TABLE IF NOT EXISTS unauthorized_signins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET NOT NULL
);

-- 4. Function to log sign-in
CREATE OR REPLACE FUNCTION log_admin_signin(p_email TEXT, p_ip INET)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_admin_id FROM admin_users WHERE email = p_email;

  IF v_admin_id IS NOT NULL THEN
    INSERT INTO admin_signins (admin_id, ip_address)
    VALUES (v_admin_id, p_ip);
  ELSE
    INSERT INTO unauthorized_signins (email, ip_address)
    VALUES (p_email, p_ip);
  END IF;
END;
$$;

-- Create check_column_exists function
CREATE OR REPLACE FUNCTION check_column_exists(table_name TEXT, column_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
   exists_bool BOOLEAN;
BEGIN
   SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = check_column_exists.table_name
        AND column_name = check_column_exists.column_name
   ) INTO exists_bool;
   
   RETURN exists_bool;
END;
$$ LANGUAGE plpgsql;

-- Create add_column_if_not_exists function
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
  table_name TEXT,
  column_name TEXT,
  column_type TEXT
)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = add_column_if_not_exists.table_name
      AND column_name = add_column_if_not_exists.column_name
  ) THEN
    EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', 
                   add_column_if_not_exists.table_name, 
                   add_column_if_not_exists.column_name, 
                   add_column_if_not_exists.column_type);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add these tables after the existing table definitions

-- Setup quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  client_id UUID REFERENCES customers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_email TEXT,
  sent_email_at TIMESTAMP WITHOUT TIME ZONE
);

-- Setup quote_options table
CREATE TABLE IF NOT EXISTS quote_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  pickup_date TEXT,
  delivery_date TEXT,
  total_rate NUMERIC(10, 2) NOT NULL,
  transit_time TEXT,
  is_recommended BOOLEAN DEFAULT FALSE,
  notes TEXT,
  status TEXT DEFAULT 'Pending',
  carrier TEXT,
  distance NUMERIC(10, 2),
  weight NUMERIC(10, 2),
  equipment_type TEXT,
  co2_emissions NUMERIC(10, 2),
  trees_needed NUMERIC(10, 2),
  fuel_cost NUMERIC(10, 2),
  driver_pay NUMERIC(10, 2),
  equipment_maintenance NUMERIC(10, 2),
  overhead_cost NUMERIC(10, 2),
  insurance_cost NUMERIC(10, 2),
  overheads_servicecost NUMERIC(10, 2),
  features TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  truckmpg TEXT,
  driverratepermile NUMERIC,
  estfuel_needed NUMERIC,
  costperliter NUMERIC,
  carbon_offsetneeded NUMERIC,
  showcost_trasnperency TEXT,
  overhead_and_servicecost NUMERIC,
  maintance_and_insurance NUMERIC
);

-- Create a trigger function for updating the modified column if it doesn't exist
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for the quotes table
DROP TRIGGER IF EXISTS update_quotes_modtime ON quotes;
CREATE TRIGGER update_quotes_modtime
BEFORE UPDATE ON quotes
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create triggers for the quote_options table
DROP TRIGGER IF EXISTS update_quote_options_modtime ON quote_options;
CREATE TRIGGER update_quote_options_modtime
BEFORE UPDATE ON quote_options
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
