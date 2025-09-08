-- Continue with quiz security fix: Update quiz_questions policies
-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON public.quiz_questions;

-- Create secure functions to serve quiz questions
-- Function to get quiz questions without answers (for taking quiz)
CREATE OR REPLACE FUNCTION public.get_quiz_questions_for_attempt(quiz_id_param uuid)
RETURNS TABLE (
  id uuid,
  quiz_id uuid,
  question text,
  type question_type,
  options jsonb,
  order_index integer,
  points integer
)
LANGUAGE sql
SECURITY DEFINER
STABLE
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
  WHERE qq.quiz_id = quiz_id_param
  ORDER BY qq.order_index;
$$;

-- Function to get quiz questions with answers (for review after completion)
CREATE OR REPLACE FUNCTION public.get_quiz_questions_with_answers(quiz_id_param uuid)
RETURNS TABLE (
  id uuid,
  quiz_id uuid,
  question text,
  type question_type,
  options jsonb,
  correct_answer jsonb,
  explanation text,
  order_index integer,
  points integer
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    qq.id,
    qq.quiz_id,
    qq.question,
    qq.type,
    qq.options,
    qq.correct_answer,
    qq.explanation,
    qq.order_index,
    qq.points
  FROM public.quiz_questions qq
  JOIN public.quizzes q ON qq.quiz_id = q.id
  WHERE qq.quiz_id = quiz_id_param
  AND (
    -- Show answers if quiz allows it and user has completed an attempt
    (q.show_correct_answers = true AND EXISTS (
      SELECT 1 FROM public.quiz_attempts qa 
      WHERE qa.quiz_id = quiz_id_param 
      AND qa.user_id = auth.uid() 
      AND qa.completed_at IS NOT NULL
    ))
    -- Or if user is admin/professor
    OR has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM quizzes quiz
      JOIN content c ON quiz.content_id = c.id
      JOIN modules m ON c.module_id = m.id
      JOIN class_trails ct ON m.trail_id = ct.trail_id
      JOIN class_professors cp ON ct.class_id = cp.class_id
      WHERE quiz.id = quiz_id_param
      AND cp.professor_id = auth.uid()
    )
  )
  ORDER BY qq.order_index;
$$;

-- Update quiz_questions policies
-- Drop existing admin policy and recreate
DROP POLICY IF EXISTS "Admins can manage quiz questions" ON public.quiz_questions;

CREATE POLICY "Admins can manage quiz questions"
ON public.quiz_questions
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Professors can manage questions for their class quizzes"
ON public.quiz_questions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN content c ON q.content_id = c.id
    JOIN modules m ON c.module_id = m.id
    JOIN class_trails ct ON m.trail_id = ct.trail_id
    JOIN class_professors cp ON ct.class_id = cp.class_id
    WHERE q.id = quiz_questions.quiz_id
    AND cp.professor_id = auth.uid()
  )
);

-- Users can only view basic question info (no answers) through functions
-- No direct SELECT policy - forces use of security functions