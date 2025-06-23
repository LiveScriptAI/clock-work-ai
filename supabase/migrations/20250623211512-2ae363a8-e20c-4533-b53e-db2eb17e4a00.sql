
-- First, let's drop the existing foreign key constraint on invoice_settings
ALTER TABLE public.invoice_settings DROP CONSTRAINT IF EXISTS invoice_settings_user_id_fkey;

-- Now add the correct foreign key constraint to reference profiles table
ALTER TABLE public.invoice_settings 
ADD CONSTRAINT invoice_settings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also make sure user_id is not nullable since it's required for RLS
ALTER TABLE public.invoice_settings ALTER COLUMN user_id SET NOT NULL;

-- Add RLS policies for invoice_settings table (updating existing ones)
DROP POLICY IF EXISTS "Users can view their own invoice settings" ON public.invoice_settings;
DROP POLICY IF EXISTS "Users can update their own invoice settings" ON public.invoice_settings;  
DROP POLICY IF EXISTS "Users can insert their own invoice settings" ON public.invoice_settings;

CREATE POLICY "Users can view their own invoice settings" ON public.invoice_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoice settings" ON public.invoice_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoice settings" ON public.invoice_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
