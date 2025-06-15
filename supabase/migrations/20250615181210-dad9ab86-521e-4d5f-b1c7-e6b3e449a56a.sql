
-- First, let's check and fix the foreign key constraints to allow proper user deletion

-- Drop existing foreign key constraint on shifts table if it exists (without CASCADE)
ALTER TABLE public.shifts DROP CONSTRAINT IF EXISTS shifts_user_id_fkey;

-- Add the foreign key constraint with CASCADE delete
ALTER TABLE public.shifts 
ADD CONSTRAINT shifts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Do the same for other tables that reference users

-- Fix break_intervals table
ALTER TABLE public.break_intervals DROP CONSTRAINT IF EXISTS break_intervals_user_id_fkey;
ALTER TABLE public.break_intervals 
ADD CONSTRAINT break_intervals_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix invoice_recipients table  
ALTER TABLE public.invoice_recipients DROP CONSTRAINT IF EXISTS invoice_recipients_user_id_fkey;
ALTER TABLE public.invoice_recipients 
ADD CONSTRAINT invoice_recipients_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix invoice_settings table
ALTER TABLE public.invoice_settings DROP CONSTRAINT IF EXISTS invoice_settings_user_id_fkey;
ALTER TABLE public.invoice_settings 
ADD CONSTRAINT invoice_settings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix profiles table (this should already have CASCADE from the handle_new_user function)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix subscribers table if it references users
ALTER TABLE public.subscribers DROP CONSTRAINT IF EXISTS subscribers_user_id_fkey;
ALTER TABLE public.subscribers 
ADD CONSTRAINT subscribers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add RLS policies to ensure proper access control for user deletion
-- (This ensures users can only delete their own data, but admins can delete any user)

-- Enable RLS on all tables if not already enabled
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.break_intervals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for user data access
-- Users can access their own data
CREATE POLICY "Users can access own shifts" ON public.shifts
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own break_intervals" ON public.break_intervals
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own invoice_recipients" ON public.invoice_recipients
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own invoice_settings" ON public.invoice_settings
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own profile" ON public.profiles
FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can access own subscriber data" ON public.subscribers
FOR ALL USING (auth.uid() = user_id);
