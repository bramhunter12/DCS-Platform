
-- Drop the foreign key constraint on user_roles for seeding demo data
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
