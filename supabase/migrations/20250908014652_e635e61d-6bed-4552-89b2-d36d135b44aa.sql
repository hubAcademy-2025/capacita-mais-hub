-- Add missing RLS policies for junction tables

-- RLS Policies for class_professors
CREATE POLICY "Authenticated users can view class professors" ON public.class_professors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage class professors" ON public.class_professors FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for class_trails
CREATE POLICY "Authenticated users can view class trails" ON public.class_trails FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage class trails" ON public.class_trails FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for badges (public read, admin manage)
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Admins can manage badges" ON public.badges FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_badges
CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all user badges" ON public.user_badges FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for post_likes
CREATE POLICY "Users can view likes in their classes" ON public.post_likes 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.community_posts cp
    JOIN public.enrollments e ON cp.class_id = e.class_id
    WHERE cp.id = post_likes.post_id AND e.student_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.community_posts cp
    JOIN public.class_professors cpr ON cp.class_id = cpr.class_id
    WHERE cp.id = post_likes.post_id AND cpr.professor_id = auth.uid()
  )
);
CREATE POLICY "Users can like posts in their classes" ON public.post_likes 
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND (
    EXISTS (
      SELECT 1 FROM public.community_posts cp
      JOIN public.enrollments e ON cp.class_id = e.class_id
      WHERE cp.id = post_likes.post_id AND e.student_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.community_posts cp
      JOIN public.class_professors cpr ON cp.class_id = cpr.class_id
      WHERE cp.id = post_likes.post_id AND cpr.professor_id = auth.uid()
    )
  )
);
CREATE POLICY "Users can remove own likes" ON public.post_likes FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for meetings
CREATE POLICY "Class members can view meetings" ON public.meetings 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE class_id = meetings.class_id AND student_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.class_professors 
    WHERE class_id = meetings.class_id AND professor_id = auth.uid()
  )
);
CREATE POLICY "Professors can manage meetings in their classes" ON public.meetings 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.class_professors 
    WHERE class_id = meetings.class_id AND professor_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage all meetings" ON public.meetings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for meeting_attendance
CREATE POLICY "Users can view own attendance" ON public.meeting_attendance FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Professors can view attendance in their meetings" ON public.meeting_attendance 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.meetings m
    JOIN public.class_professors cp ON m.class_id = cp.class_id
    WHERE m.id = meeting_attendance.meeting_id AND cp.professor_id = auth.uid()
  )
);
CREATE POLICY "Users can update own attendance" ON public.meeting_attendance FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Professors can manage attendance in their meetings" ON public.meeting_attendance 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.meetings m
    JOIN public.class_professors cp ON m.class_id = cp.class_id
    WHERE m.id = meeting_attendance.meeting_id AND cp.professor_id = auth.uid()
  )
);

-- RLS Policies for certificates
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all certificates" ON public.certificates FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can issue certificates" ON public.certificates FOR INSERT WITH CHECK (true); -- Certificates are issued by system

-- Fix search_path for functions
CREATE OR REPLACE FUNCTION public.get_user_roles(user_uuid UUID DEFAULT auth.uid())
RETURNS TEXT[]
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT ARRAY_AGG(role::text) 
  FROM public.user_roles 
  WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = role_name::public.user_role
  );
$$;