
-- Add RLS policies for invoice_settings table
ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own invoice settings" ON public.invoice_settings;
DROP POLICY IF EXISTS "Users can update their own invoice settings" ON public.invoice_settings;
DROP POLICY IF EXISTS "Users can insert their own invoice settings" ON public.invoice_settings;

-- Policy to allow users to view their own invoice settings
CREATE POLICY "Users can view their own invoice settings" ON public.invoice_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to update their own invoice settings
CREATE POLICY "Users can update their own invoice settings" ON public.invoice_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to insert their own invoice settings
CREATE POLICY "Users can insert their own invoice settings" ON public.invoice_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
