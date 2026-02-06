-- Add 'buyer' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'buyer';

-- Create a function to get listing limit based on role
CREATE OR REPLACE FUNCTION public.get_listing_limit(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE 
    WHEN public.has_role(_user_id, 'admin') THEN 999999
    WHEN public.has_role(_user_id, 'super_seller') THEN 999999
    WHEN public.has_role(_user_id, 'individual_seller') THEN 25
    WHEN public.has_role(_user_id, 'observer') THEN 3
    ELSE 0
  END
$$;

-- Create a function to get commission rate based on role
CREATE OR REPLACE FUNCTION public.get_commission_rate(_user_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE 
    WHEN public.has_role(_user_id, 'super_seller') THEN 0.00
    WHEN public.has_role(_user_id, 'individual_seller') THEN 0.025
    WHEN public.has_role(_user_id, 'observer') THEN 0.035
    ELSE 0.00
  END
$$;

-- Update can_sell function to include observer (Private Holder can now sell with limits)
CREATE OR REPLACE FUNCTION public.can_sell(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('observer', 'individual_seller', 'super_seller', 'admin')
  )
$$;