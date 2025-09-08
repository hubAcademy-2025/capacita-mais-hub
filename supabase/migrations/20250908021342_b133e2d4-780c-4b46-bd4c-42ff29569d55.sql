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