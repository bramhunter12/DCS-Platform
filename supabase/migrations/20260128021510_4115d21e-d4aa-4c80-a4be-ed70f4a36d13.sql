
-- Drop the foreign key constraint temporarily for seeding demo data
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- We'll re-add it after seeding if needed, or keep it removed for demo purposes
-- For demo/sample data, we need profiles that don't reference real auth users
