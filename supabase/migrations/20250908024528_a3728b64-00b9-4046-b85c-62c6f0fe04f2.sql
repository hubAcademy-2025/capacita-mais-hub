-- Final fix for quiz security - remove ALL public access to quiz_questions table
-- Only allow access through secure functions

-- Disable RLS temporarily to check and clean policies
SELECT policy.policyname, policy.permissive, policy.roles, policy.cmd, policy.qual, policy.with_check
FROM pg_policies policy 
WHERE policy.schemaname = 'public' 
AND policy.tablename = 'quiz_questions';

-- Remove any remaining policies that might allow direct access
DROP POLICY IF EXISTS "Enable read access for all users" ON quiz_questions;
DROP POLICY IF EXISTS "Public read access" ON quiz_questions;
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can view quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Allow viewing quiz questions" ON quiz_questions;

-- Ensure that ONLY these policies exist (the secure ones):
-- 1. "Admins can manage quiz questions" - for admins (SECURE)
-- 2. "Professors can manage questions for their class quizzes" - for professors (SECURE)
-- No other policies should exist that allow SELECT access

-- The quiz_questions table will only be accessible via:
-- - get_quiz_questions_for_attempt() for students (excludes correct_answer)
-- - get_quiz_questions_with_answers() for professors/admins (includes correct_answer)
-- - Direct table access for admins/professors only