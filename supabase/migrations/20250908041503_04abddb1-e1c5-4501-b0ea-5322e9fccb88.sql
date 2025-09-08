-- Create modules table
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trail_id UUID REFERENCES public.trails(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on modules
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Create policies for modules
CREATE POLICY "Admins can manage modules" 
ON public.modules 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view modules" 
ON public.modules 
FOR SELECT 
USING (true);

-- Create content table
CREATE TABLE public.content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type content_type NOT NULL,
  url TEXT,
  duration TEXT,
  order_index INTEGER NOT NULL,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on content
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Create policies for content
CREATE POLICY "Admins can manage content" 
ON public.content 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view content" 
ON public.content 
FOR SELECT 
USING (true);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit INTEGER, -- in minutes
  passing_score INTEGER NOT NULL DEFAULT 70,
  allow_retakes BOOLEAN DEFAULT true,
  show_correct_answers BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Create policies for quizzes
CREATE POLICY "Admins can manage quizzes" 
ON public.quizzes 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view quizzes" 
ON public.quizzes 
FOR SELECT 
USING (true);

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type question_type NOT NULL,
  options JSONB, -- for multiple choice questions
  correct_answer JSONB NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on quiz_questions
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_questions
CREATE POLICY "Admins can manage quiz questions" 
ON public.quiz_questions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Professors can manage questions for their class quizzes
CREATE POLICY "Professors can manage questions for their class quizzes" 
ON public.quiz_questions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.content c ON q.content_id = c.id
    JOIN public.modules m ON c.module_id = m.id
    JOIN public.class_trails ct ON m.trail_id = ct.trail_id
    JOIN public.class_professors cp ON ct.class_id = cp.class_id
    WHERE q.id = quiz_questions.quiz_id
    AND cp.professor_id = auth.uid()
  )
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();