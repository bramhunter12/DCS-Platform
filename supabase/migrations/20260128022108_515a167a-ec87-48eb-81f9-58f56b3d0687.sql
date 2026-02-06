
-- Drop foreign key constraint on listings for seeding demo data
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_seller_id_fkey;
