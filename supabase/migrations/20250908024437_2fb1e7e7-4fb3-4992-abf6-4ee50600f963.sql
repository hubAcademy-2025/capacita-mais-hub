-- Check current policies and fix the quiz security issue properly
-- The quiz_questions table should NOT have any SELECT policies for regular users
-- Only admins and professors should access the table directly

-- First, let's see what policies exist and remove any that allow general access
DO $$
DECLARE
    pol record;
BEGIN
    -- List and drop any overly permissive policies
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'quiz_questions' 
        AND schemaname = 'public'
        AND NOT (
            policyname LIKE '%admin%' OR 
            policyname LIKE '%professor%' OR
            policyname LIKE '%manage%'
        )
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON quiz_questions';
    END LOOP;
END $$;

-- Ensure ONLY these secure policies exist for quiz_questions:
-- 1. Admins can manage (already exists)
-- 2. Professors can manage for their classes (already exists)
-- 3. NO general SELECT policy for students

-- Students should ONLY access quiz questions through the secure functions
-- which filter out correct_answer, correct_solution, and explanation fields

-- Verify our secure function works correctly
-- Students will use get_quiz_questions_for_attempt() which excludes sensitive fields
-- Professors/admins will use get_quiz_questions_with_answers() which includes everything