-- Remove the policy that always returns false
DROP POLICY IF EXISTS "Users can view public profile info of others" ON public.profiles;

-- Create a new policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Create a policy for professors to view basic profile info of students in their classes
CREATE POLICY "Professors can view student profiles in their classes" 
ON public.profiles 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND (
    -- Allow if user is a professor viewing students in their classes
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN class_professors cp ON e.class_id = cp.class_id
      WHERE e.student_id = profiles.id 
      AND cp.professor_id = auth.uid()
    )
  )
);