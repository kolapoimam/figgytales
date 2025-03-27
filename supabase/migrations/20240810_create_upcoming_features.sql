
-- Create the upcoming_features table
CREATE TABLE IF NOT EXISTS public.upcoming_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the feature_upvotes table
CREATE TABLE IF NOT EXISTS public.feature_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES public.upcoming_features(id) ON DELETE CASCADE,
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_feature UNIQUE NULLS NOT DISTINCT (user_id, feature_id),
  CONSTRAINT unique_ip_feature UNIQUE NULLS NOT DISTINCT (ip_address, feature_id),
  CONSTRAINT user_or_ip_required CHECK (
    (user_id IS NOT NULL) OR (ip_address IS NOT NULL)
  )
);

-- Add RLS policies
ALTER TABLE public.upcoming_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_upvotes ENABLE ROW LEVEL SECURITY;

-- Everyone can read upcoming features
CREATE POLICY "Anyone can read upcoming features"
  ON public.upcoming_features
  FOR SELECT
  USING (true);

-- Only authenticated users can insert/update/delete upcoming features  
CREATE POLICY "Only authenticated users can manage upcoming features"
  ON public.upcoming_features
  USING (auth.role() = 'authenticated');

-- Everyone can read upvotes
CREATE POLICY "Anyone can read upvotes"
  ON public.feature_upvotes
  FOR SELECT
  USING (true);

-- Users can upvote features
CREATE POLICY "Users can upvote features"
  ON public.feature_upvotes
  FOR INSERT
  WITH CHECK (true);

-- Index for faster upvote queries
CREATE INDEX feature_upvotes_feature_id_idx ON public.feature_upvotes(feature_id);
CREATE INDEX feature_upvotes_user_id_idx ON public.feature_upvotes(user_id);
CREATE INDEX feature_upvotes_ip_address_idx ON public.feature_upvotes(ip_address);
