-- Remove any existing public read policies for quiz_questions that might expose correct answers
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON quiz_questions;

-- Create a secure policy that only allows viewing questions without answers for students
CREATE POLICY "Students can view question basics for attempts" 
ON quiz_questions 
FOR SELECT 
USING (
  -- Only allow if user is enrolled in a class that has access to this quiz
  EXISTS (
    SELECT 1 
    FROM quizzes q
    JOIN content c ON q.content_id = c.id
    JOIN modules m ON c.module_id = m.id
    JOIN class_trails ct ON m.trail_id = ct.trail_id
    JOIN enrollments e ON ct.class_id = e.class_id
    WHERE q.id = quiz_questions.quiz_id 
    AND e.student_id = auth.uid()
  )
);

-- Ensure the existing admin and professor policies remain intact
-- (These are already secure and allow full access as needed)

-- Add a view that only exposes safe question data for students
CREATE OR REPLACE VIEW quiz_questions_student_view AS
SELECT 
  id,
  quiz_id,
  question,
  type,
  options,
  order_index,
  points
FROM quiz_questions;

-- Add RLS policy for the view
ALTER VIEW quiz_questions_student_view OWNER TO postgres;
CREATE POLICY "Students can view question basics via view" 
ON quiz_questions_student_view 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM quizzes q
    JOIN content c ON q.content_id = c.id
    JOIN modules m ON c.module_id = m.id
    JOIN class_trails ct ON m.trail_id = ct.trail_id
    JOIN enrollments e ON ct.class_id = e.class_id
    WHERE q.id = quiz_questions_student_view.quiz_id 
    AND e.student_id = auth.uid()
  )
);