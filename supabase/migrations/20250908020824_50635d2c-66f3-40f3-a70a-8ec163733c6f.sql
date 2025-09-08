-- Fix security issue: Restrict profile visibility to protect user email addresses
-- Remove the overly permissive policy that allows all users to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create more restrictive policies
-- Allow users to view their own complete profile (including email)
CREATE POLICY "Users can view own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Create a security definer function to get public profile info only
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  avatar_url text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT p.id, p.name, p.avatar_url, p.created_at
  FROM public.profiles p
  WHERE p.id = profile_id;
$$;

-- Allow authenticated users to view public profile information of others
-- This policy only allows access to name and avatar, not email
CREATE POLICY "Users can view public profile info of others" 
ON public.profiles 
FOR SELECT 
USING (
  auth.role() = 'authenticated' 
  AND auth.uid() != id 
  AND false -- This forces queries to go through the function above
);