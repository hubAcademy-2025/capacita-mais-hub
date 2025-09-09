-- Security Fix: Remove public access and implement enrollment-based access control

-- 1. Drop existing public access policies for educational content
DROP POLICY IF EXISTS "Anyone can view content" ON public.content;
DROP POLICY IF EXISTS "Anyone can view modules" ON public.modules;
DROP POLICY IF EXISTS "Anyone can view trails" ON public.trails;

-- 2. Create enrollment-based policies for content table
CREATE POLICY "Students can view content in enrolled classes" ON public.content
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM modules m
    JOIN class_trails ct ON m.trail_id = ct.trail_id
    JOIN enrollments e ON ct.class_id = e.class_id
    WHERE m.id = content.module_id 
    AND e.student_id = auth.uid()
  )
);

CREATE POLICY "Professors can view content in their classes" ON public.content
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM modules m
    JOIN class_trails ct ON m.trail_id = ct.trail_id
    JOIN class_professors cp ON ct.class_id = cp.class_id
    WHERE m.id = content.module_id 
    AND cp.professor_id = auth.uid()
  )
);

-- 3. Create enrollment-based policies for modules table
CREATE POLICY "Students can view modules in enrolled classes" ON public.modules
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM class_trails ct
    JOIN enrollments e ON ct.class_id = e.class_id
    WHERE ct.trail_id = modules.trail_id 
    AND e.student_id = auth.uid()
  )
);

CREATE POLICY "Professors can view modules in their classes" ON public.modules
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM class_trails ct
    JOIN class_professors cp ON ct.class_id = cp.class_id
    WHERE ct.trail_id = modules.trail_id 
    AND cp.professor_id = auth.uid()
  )
);

-- 4. Create enrollment-based policies for trails table
CREATE POLICY "Students can view trails in enrolled classes" ON public.trails
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM class_trails ct
    JOIN enrollments e ON ct.class_id = e.class_id
    WHERE ct.trail_id = trails.id 
    AND e.student_id = auth.uid()
  )
);

CREATE POLICY "Professors can view trails in their classes" ON public.trails
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM class_trails ct
    JOIN class_professors cp ON ct.class_id = cp.class_id
    WHERE ct.trail_id = trails.id 
    AND cp.professor_id = auth.uid()
  )
);

-- 5. Secure quiz questions access - students get questions without answers
CREATE POLICY "Students can view quiz questions (no answers) in enrolled classes" ON public.quiz_questions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN content c ON q.content_id = c.id
    JOIN modules m ON c.module_id = m.id
    JOIN class_trails ct ON m.trail_id = ct.trail_id
    JOIN enrollments e ON ct.class_id = e.class_id
    WHERE q.id = quiz_questions.quiz_id 
    AND e.student_id = auth.uid()
  )
);

-- 6. Add content access audit logging table
CREATE TABLE IF NOT EXISTS public.content_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_id uuid,
  quiz_id uuid,
  trail_id uuid,
  access_type text NOT NULL, -- 'view', 'quiz_attempt', 'video_play'
  accessed_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS on audit log table
ALTER TABLE public.content_access_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all access logs
CREATE POLICY "Admins can view all access logs" ON public.content_access_logs
FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Professors can view logs for their class content
CREATE POLICY "Professors can view access logs for their classes" ON public.content_access_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM content c
    JOIN modules m ON c.module_id = m.id
    JOIN class_trails ct ON m.trail_id = ct.trail_id
    JOIN class_professors cp ON ct.class_id = cp.class_id
    WHERE c.id = content_access_logs.content_id 
    AND cp.professor_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM quizzes q
    JOIN content c ON q.content_id = c.id
    JOIN modules m ON c.module_id = m.id
    JOIN class_trails ct ON m.trail_id = ct.trail_id
    JOIN class_professors cp ON ct.class_id = cp.class_id
    WHERE q.id = content_access_logs.quiz_id 
    AND cp.professor_id = auth.uid()
  )
);

-- System can insert access logs
CREATE POLICY "System can insert access logs" ON public.content_access_logs
FOR INSERT WITH CHECK (true);

-- 7. Create function to log content access
CREATE OR REPLACE FUNCTION public.log_content_access(
  p_content_id uuid DEFAULT NULL,
  p_quiz_id uuid DEFAULT NULL,
  p_trail_id uuid DEFAULT NULL,
  p_access_type text DEFAULT 'view'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.content_access_logs (
    user_id, 
    content_id, 
    quiz_id, 
    trail_id, 
    access_type
  ) VALUES (
    auth.uid(), 
    p_content_id, 
    p_quiz_id, 
    p_trail_id, 
    p_access_type
  );
END;
$$;