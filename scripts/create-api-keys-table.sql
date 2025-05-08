-- Create the api_keys table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.api_keys (
  id SERIAL PRIMARY KEY,
  api_key TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  name TEXT,
  description TEXT,
  service TEXT
);

-- Add RLS policies
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Authenticated users can read api_keys"
  ON public.api_keys
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for authenticated users to update api_keys
CREATE POLICY "Authenticated users can update api_keys"
  ON public.api_keys
  FOR UPDATE
  TO authenticated
  USING (true);

-- Insert a record for FMCSA API key if it doesn't exist
INSERT INTO public.api_keys (id, name, service, description)
VALUES (6, 'FMCSA API Key', 'fmcsa', 'API key for FMCSA carrier lookup service')
ON CONFLICT (id) DO NOTHING;
