-- Security Fix: Update existing policies to implement enrollment-based access control

-- 1. Drop existing policies that need to be replaced
DROP POLICY IF EXISTS "Anyone can view content" ON public.content;
DROP POLICY IF EXISTS "Anyone can view modules" ON public.modules; 
DROP POLICY IF EXISTS "Anyone can view trails" ON public.trails;
DROP POLICY IF EXISTS "Students can view content in enrolled classes" ON public.content;
DROP POLICY IF EXISTS "Students can view modules in enrolled classes" ON public.modules;
DROP POLICY IF EXISTS "Students can view trails in enrolled classes" ON public.trails;
DROP POLICY IF EXISTS "Professors can view content in their classes" ON public.content;
DROP POLICY IF EXISTS "Professors can view modules in their classes" ON public.modules;
DROP POLICY IF EXISTS "Professors can view trails in their classes" ON public.trails;
DROP POLICY IF EXISTS "Students can view quiz questions (no answers) in enrolled classes" ON public.quiz_questions;

-- 2. Create secure enrollment-based policies for content
CREATE POLICY "Enrolled students can view content" ON public.content
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM modules m
    JOIN class_trails ct ON m.trail_id = ct.trail_id
    JOIN enrollments e ON ct.class_id = e.class_id
    WHERE m.id = content.module_id 
    AND e.student_id = auth.uid()
  )
);

CREATE POLICY "Class professors can view content" ON public.content
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM modules m
    JOIN class_trails ct ON m.trail_id = ct.trail_id
    JOIN class_professors cp ON ct.class_id = cp.class_id
    WHERE m.id = content.module_id 
    AND cp.professor_id = auth.uid()
  )
);

-- 3. Create secure enrollment-based policies for modules
CREATE POLICY "Enrolled students can view modules" ON public.modules
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM class_trails ct
    JOIN enrollments e ON ct.class_id = e.class_id
    WHERE ct.trail_id = modules.trail_id 
    AND e.student_id = auth.uid()
  )
);

CREATE POLICY "Class professors can view modules" ON public.modules
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM class_trails ct
    JOIN class_professors cp ON ct.class_id = cp.class_id
    WHERE ct.trail_id = modules.trail_id 
    AND cp.professor_id = auth.uid()
  )
);

-- 4. Create secure enrollment-based policies for trails
CREATE POLICY "Enrolled students can view trails" ON public.trails
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM class_trails ct
    JOIN enrollments e ON ct.class_id = e.class_id
    WHERE ct.trail_id = trails.id 
    AND e.student_id = auth.uid()
  )
);

CREATE POLICY "Class professors can view trails" ON public.trails
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM class_trails ct
    JOIN class_professors cp ON ct.class_id = cp.class_id
    WHERE ct.trail_id = trails.id 
    AND cp.professor_id = auth.uid()
  )
);

-- 5. Secure quiz questions - only enrolled students can view (without answers in separate function)
CREATE POLICY "Enrolled students can view quiz questions" ON public.quiz_questions
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