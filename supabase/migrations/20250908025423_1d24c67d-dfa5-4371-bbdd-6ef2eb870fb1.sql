-- Create profile and role for the existing user
INSERT INTO profiles (id, name, email) 
VALUES ('7fb40508-a6e3-4f3a-a871-a1d2f95ad925', 'Vinicius Nunes', 'viniciusnunes137@gmail.com');

INSERT INTO user_roles (user_id, role)
VALUES ('7fb40508-a6e3-4f3a-a871-a1d2f95ad925', 'admin');

-- Let's also check if the trigger exists and is working
-- If needed, we'll recreate it to ensure it works for future users

-- Update the trigger to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  -- Assign default role as 'aluno' (student)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'aluno');
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();