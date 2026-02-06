
-- Drop foreign key constraint on posts for seeding demo data
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
