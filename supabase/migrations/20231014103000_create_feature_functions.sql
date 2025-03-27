
-- Create function to get features with counts and user upvote status
CREATE OR REPLACE FUNCTION public.get_features_with_counts()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  created_at timestamptz,
  upvote_count bigint,
  has_upvoted boolean
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.title,
    f.description,
    f.created_at,
    COUNT(u.id)::bigint AS upvote_count,
    EXISTS (
      SELECT 1 FROM public.feature_upvotes u2 
      WHERE u2.feature_id = f.id AND 
      ((auth.uid() IS NOT NULL AND u2.user_id = auth.uid()) OR 
       (auth.uid() IS NULL AND u2.ip_address = current_setting('request.headers')::json->>'custom-client-id', false))
    ) AS has_upvoted
  FROM 
    public.upcoming_features f
  LEFT JOIN 
    public.feature_upvotes u ON f.id = u.feature_id
  GROUP BY 
    f.id, f.title, f.description, f.created_at;
END;
$$;

-- Create function to handle upvoting
CREATE OR REPLACE FUNCTION public.upvote_feature(
  p_feature_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_ip_address text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert the upvote
  INSERT INTO public.feature_upvotes (feature_id, user_id, ip_address)
  VALUES (p_feature_id, p_user_id, p_ip_address);
  
  -- Handle unique constraint violation silently
  EXCEPTION WHEN unique_violation THEN
    -- Do nothing, user has already upvoted
END;
$$;
