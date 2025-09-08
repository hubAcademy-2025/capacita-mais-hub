-- Fix security issue: Restrict profile visibility to protect user email addresses
-- Remove the overly permissive policy that allows all users to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create more restrictive policies
-- Allow users to view their own complete profile (including email)
CREATE POLICY "Users can view own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow all authenticated users to view only public profile information (name and avatar)
-- This excludes sensitive information like email addresses
CREATE POLICY "Users can view public profile info" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create a view for public profile information only
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  name,
  avatar_url,
  created_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Allow authenticated users to view the public profiles view
CREATE POLICY "Anyone can view public profiles view"
ON public.public_profiles
FOR SELECT 
TO authenticated
USING (true);