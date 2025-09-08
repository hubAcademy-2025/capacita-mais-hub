-- Fix quiz security issue: Prevent students from seeing answers before completing quiz
-- First, create tables to track quiz attempts and results

-- Create quiz attempts table to track when students take quizzes
CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quiz_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  score integer,
  passed boolean,
  answers jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on quiz attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for quiz attempts
CREATE POLICY "Users can create own quiz attempts"
ON public.quiz_attempts
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own quiz attempts"
ON public.quiz_attempts
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update own quiz attempts"
ON public.quiz_attempts
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Professors can view attempts for their class quizzes"
ON public.quiz_attempts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN content c ON q.content_id = c.id
    JOIN modules m ON c.module_id = m.id
    JOIN class_trails ct ON m.trail_id = ct.trail_id
    JOIN class_professors cp ON ct.class_id = cp.class_id
    WHERE q.id = quiz_attempts.quiz_id
    AND cp.professor_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all quiz attempts"
ON public.quiz_attempts
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_quiz_attempts_updated_at
BEFORE UPDATE ON public.quiz_attempts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Now fix the quiz_questions security issue
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

-- Create restrictive policies for quiz_questions
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