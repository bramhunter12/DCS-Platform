-- ============================================
-- PRESTIGE WATCH EXCHANGE - PHASE 1 SCHEMA
-- ============================================

-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'observer', 'individual_seller', 'super_seller');

-- 2. Create listing status enum
CREATE TYPE public.listing_status AS ENUM ('draft', 'pending_review', 'approved', 'rejected', 'sold', 'archived');

-- 3. Create watch condition enum
CREATE TYPE public.watch_condition AS ENUM ('unworn', 'excellent', 'very_good', 'good', 'fair');

-- 4. Create verification status enum
CREATE TYPE public.verification_status AS ENUM ('not_started', 'pending', 'verified', 'rejected');

-- 5. Create transaction status enum
CREATE TYPE public.transaction_status AS ENUM ('pending_payment', 'payment_held', 'shipped', 'delivered', 'completed', 'disputed', 'refunded', 'cancelled');

-- 6. Create post category enum
CREATE TYPE public.post_category AS ENUM ('market_insights', 'reference_guides', 'authentication');

-- ============================================
-- CORE TABLES
-- ============================================

-- User profiles (extended user data)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT,
  stripe_connect_account_id TEXT,
  kyc_status verification_status NOT NULL DEFAULT 'not_started',
  kyc_verified_at TIMESTAMPTZ,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_tier TEXT,
  subscription_ends_at TIMESTAMPTZ,
  zero_fee_eligible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Watch brands (controlled list)
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert common luxury watch brands
INSERT INTO public.brands (name, display_order) VALUES
  ('Rolex', 1),
  ('Patek Philippe', 2),
  ('Audemars Piguet', 3),
  ('Omega', 4),
  ('Cartier', 5),
  ('IWC', 6),
  ('Jaeger-LeCoultre', 7),
  ('Vacheron Constantin', 8),
  ('A. Lange & Söhne', 9),
  ('Breguet', 10),
  ('Blancpain', 11),
  ('Panerai', 12),
  ('Tudor', 13),
  ('Grand Seiko', 14),
  ('Zenith', 15),
  ('Hublot', 16),
  ('Richard Mille', 17),
  ('Breitling', 18),
  ('TAG Heuer', 19),
  ('Chopard', 20);

-- Listings
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES public.brands(id),
  model TEXT NOT NULL,
  reference_number TEXT NOT NULL,
  serial_number TEXT,
  year_produced INTEGER,
  year_produced_end INTEGER,
  condition watch_condition NOT NULL,
  has_box BOOLEAN NOT NULL DEFAULT false,
  has_papers BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  asking_price DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status listing_status NOT NULL DEFAULT 'draft',
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Listing photos (structured set)
CREATE TABLE public.listing_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  photo_type TEXT NOT NULL, -- dial_front, caseback, side_profile, clasp, box, papers
  storage_path TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pricing context (admin-managed market data)
CREATE TABLE public.pricing_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT NOT NULL,
  brand_id UUID REFERENCES public.brands(id),
  price_low DECIMAL(12, 2),
  price_expected DECIMAL(12, 2),
  price_premium DECIMAL(12, 2),
  notes TEXT,
  last_updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id),
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(12, 2) NOT NULL,
  commission_amount DECIMAL(12, 2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status transaction_status NOT NULL DEFAULT 'pending_payment',
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Community posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category post_category NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Post comments (1 level deep)
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin settings (global config)
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.admin_settings (key, value) VALUES
  ('zero_fee_period_enabled', 'true'),
  ('zero_fee_period_days', '90'),
  ('individual_seller_monthly_fee', '50'),
  ('super_seller_monthly_fee', '195'),
  ('individual_seller_commission', '0.025');

-- ============================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Function to check if user can sell (individual_seller or super_seller)
CREATE OR REPLACE FUNCTION public.can_sell(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('individual_seller', 'super_seller', 'admin')
  )
$$;

-- Function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'super_seller' THEN 2
      WHEN 'individual_seller' THEN 3
      WHEN 'observer' THEN 4
    END
  LIMIT 1
$$;

-- Function to count user's active listings
CREATE OR REPLACE FUNCTION public.count_active_listings(_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.listings
  WHERE seller_id = _user_id
    AND status IN ('draft', 'pending_review', 'approved')
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_context_updated_at
  BEFORE UPDATE ON public.pricing_context
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Default role is observer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'observer');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- Brands policies (public read)
CREATE POLICY "Anyone can view active brands"
  ON public.brands FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage brands"
  ON public.brands FOR ALL
  USING (public.is_admin(auth.uid()));

-- Listings policies
CREATE POLICY "Anyone can view approved listings"
  ON public.listings FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Sellers can view their own listings"
  ON public.listings FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can create listings"
  ON public.listings FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id 
    AND public.can_sell(auth.uid())
  );

CREATE POLICY "Sellers can update their own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Admins can view all listings"
  ON public.listings FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all listings"
  ON public.listings FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Listing photos policies
CREATE POLICY "Anyone can view photos of approved listings"
  ON public.listing_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND status = 'approved'
    )
  );

CREATE POLICY "Sellers can view their own listing photos"
  ON public.listing_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can manage their own listing photos"
  ON public.listing_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can delete their own listing photos"
  ON public.listing_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND seller_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all listing photos"
  ON public.listing_photos FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Pricing context policies
CREATE POLICY "Anyone can view pricing context"
  ON public.pricing_context FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage pricing context"
  ON public.pricing_context FOR ALL
  USING (public.is_admin(auth.uid()));

-- Transactions policies
CREATE POLICY "Buyers can view their transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view their transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "Buyers can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all transactions"
  ON public.transactions FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Posts policies (read by all, write by sellers)
CREATE POLICY "Anyone can view posts"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Sellers can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id 
    AND public.can_sell(auth.uid())
  );

CREATE POLICY "Authors can update their own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all posts"
  ON public.posts FOR ALL
  USING (public.is_admin(auth.uid()));

-- Comments policies
CREATE POLICY "Anyone can view comments"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Sellers can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id 
    AND public.can_sell(auth.uid())
  );

CREATE POLICY "Authors can update their own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all comments"
  ON public.comments FOR ALL
  USING (public.is_admin(auth.uid()));

-- Admin settings policies
CREATE POLICY "Anyone can view admin settings"
  ON public.admin_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON public.admin_settings FOR ALL
  USING (public.is_admin(auth.uid()));

-- ============================================
-- STORAGE BUCKET FOR LISTING PHOTOS
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for listing photos
CREATE POLICY "Anyone can view listing photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-photos');

CREATE POLICY "Authenticated users can upload listing photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-photos' 
    AND auth.role() = 'authenticated'
    AND public.can_sell(auth.uid())
  );

CREATE POLICY "Users can delete their own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listing-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX idx_listings_brand_id ON public.listings(brand_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_reference_number ON public.listings(reference_number);
CREATE INDEX idx_listing_photos_listing_id ON public.listing_photos(listing_id);
CREATE INDEX idx_transactions_buyer_id ON public.transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON public.transactions(seller_id);
CREATE INDEX idx_transactions_listing_id ON public.transactions(listing_id);
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_posts_category ON public.posts(category);
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_author_id ON public.comments(author_id);
CREATE INDEX idx_pricing_context_reference ON public.pricing_context(reference_number);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);