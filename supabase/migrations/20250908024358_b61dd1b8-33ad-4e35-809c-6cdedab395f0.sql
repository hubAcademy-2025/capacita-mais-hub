-- Remove the problematic policy if it exists and restrict access to quiz_questions table
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Students can view question basics for attempts" ON quiz_questions;

-- The quiz_questions table should only be accessible through secure functions
-- and by admins/professors through existing policies

-- Update the get_quiz_questions_for_attempt function to be more secure
CREATE OR REPLACE FUNCTION public.get_quiz_questions_for_attempt(quiz_id_param uuid)
RETURNS TABLE(
  id uuid, 
  quiz_id uuid, 
  question text, 
  type question_type, 
  options jsonb, 
  order_index integer, 
  points integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    qq.id,
    qq.quiz_id,
    qq.question,
    qq.type,
    qq.options,
    qq.order_index,
    qq.points
  FROM public.quiz_questions qq
  JOIN public.quizzes q ON qq.quiz_id = q.id
  JOIN public.content c ON q.content_id = c.id
  JOIN public.modules m ON c.module_id = m.id
  JOIN public.class_trails ct ON m.trail_id = ct.trail_id
  JOIN public.enrollments e ON ct.class_id = e.class_id
  WHERE qq.quiz_id = quiz_id_param
    AND e.student_id = auth.uid()
    AND (
      -- Allow if user is enrolled in the class
      e.student_id = auth.uid()
      -- Or if user is admin/professor (covered by existing RLS policies)
      OR has_role(auth.uid(), 'admin')
      OR EXISTS (
        SELECT 1 FROM class_professors cp 
        WHERE cp.class_id = ct.class_id 
        AND cp.professor_id = auth.uid()
      )
    )
  ORDER BY qq.order_index;
$$;