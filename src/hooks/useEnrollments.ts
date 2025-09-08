import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EnrollmentWithProfile {
  id: string;
  class_id: string;
  student_id: string;
  progress: number;
  final_grade: number | null;
  enrolled_at: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  };
}

export const useEnrollments = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          id,
          class_id,
          student_id,
          progress,
          final_grade,
          enrolled_at,
          profiles:student_id (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .order('enrolled_at', { ascending: false });

      if (enrollmentError) throw enrollmentError;

      const enrollmentsWithProfiles = data?.map(enrollment => ({
        id: enrollment.id,
        class_id: enrollment.class_id,
        student_id: enrollment.student_id,
        progress: enrollment.progress || 0,
        final_grade: enrollment.final_grade,
        enrolled_at: enrollment.enrolled_at,
        student: enrollment.profiles
      })) || [];

      setEnrollments(enrollmentsWithProfiles);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar matrículas');
    } finally {
      setLoading(false);
    }
  };

  const createEnrollment = async (classId: string, studentId: string) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .insert([{ 
          class_id: classId, 
          student_id: studentId,
          progress: 0
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aluno matriculado com sucesso!",
      });

      await fetchEnrollments();
    } catch (err) {
      console.error('Error creating enrollment:', err);
      toast({
        title: "Erro",
        description: "Erro ao matricular aluno",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteEnrollment = async (enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Matrícula removida com sucesso!",
      });

      await fetchEnrollments();
    } catch (err) {
      console.error('Error deleting enrollment:', err);
      toast({
        title: "Erro",
        description: "Erro ao remover matrícula",
        variant: "destructive",
      });
      throw err;
    }
  };

  const getClassEnrollments = (classId: string) => {
    return enrollments.filter(e => e.class_id === classId);
  };

  const getStudentEnrollment = (classId: string, studentId: string) => {
    return enrollments.find(e => e.class_id === classId && e.student_id === studentId);
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  return {
    enrollments,
    loading,
    error,
    createEnrollment,
    deleteEnrollment,
    getClassEnrollments,
    getStudentEnrollment,
    refetch: fetchEnrollments
  };
};