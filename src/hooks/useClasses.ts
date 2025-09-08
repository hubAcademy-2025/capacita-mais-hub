import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClassWithDetails {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  professors: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  trails: Array<{
    id: string;
    title: string;
  }>;
  student_count: number;
}

export const useClasses = () => {
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (classesError) throw classesError;

      // Get all class professors with profile info
      const { data: classProfessors, error: cpError } = await supabase
        .from('class_professors')
        .select(`
          class_id,
          professor_id,
          profiles:professor_id (
            id,
            name,
            email
          )
        `);

      if (cpError) throw cpError;

      // Get all class trails
      const { data: classTrails, error: ctError } = await supabase
        .from('class_trails')
        .select(`
          class_id,
          trail_id,
          trails:trail_id (
            id,
            title
          )
        `);

      if (ctError) throw ctError;

      // Get enrollments count per class
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('class_id');

      if (enrollError) throw enrollError;

      // Transform data
      const classesWithDetails = classesData?.map(classData => {
        const professors = classProfessors
          ?.filter(cp => cp.class_id === classData.id)
          ?.map(cp => cp.profiles)
          ?.filter(Boolean) || [];

        const trails = classTrails
          ?.filter(ct => ct.class_id === classData.id)
          ?.map(ct => ct.trails)
          ?.filter(Boolean) || [];

        const studentCount = enrollments?.filter(e => e.class_id === classData.id).length || 0;

        return {
          id: classData.id,
          name: classData.name,
          status: classData.status,
          created_at: classData.created_at,
          professors,
          trails,
          student_count: studentCount
        };
      }) || [];

      console.log('=== CLASSES DEBUG ===');
      console.log('Raw classes data:', classes);
      console.log('Class professors data:', classProfessors);
      console.log('Classes with details:', classesWithDetails);

      setClasses(classesWithDetails);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar turmas');
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (name: string, professorId: string, trailId: string) => {
    try {
      // Create class
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .insert([{ name, status: 'active' }])
        .select()
        .single();

      if (classError) throw classError;

      // Add professor to class
      const { error: professorError } = await supabase
        .from('class_professors')
        .insert([{ class_id: classData.id, professor_id: professorId }]);

      if (professorError) throw professorError;

      // Add trail to class
      const { error: trailError } = await supabase
        .from('class_trails')
        .insert([{ class_id: classData.id, trail_id: trailId }]);

      if (trailError) throw trailError;

      toast({
        title: "Sucesso",
        description: "Turma criada com sucesso!",
      });

      // Refresh data
      await fetchClasses();
      
      return classData;
    } catch (err) {
      console.error('Error creating class:', err);
      toast({
        title: "Erro",
        description: "Erro ao criar turma",
        variant: "destructive",
      });
      throw err;
    }
  };

  const getClassStats = () => {
    const activeClasses = classes.filter(c => c.status === 'active').length;
    const totalStudents = classes.reduce((acc, c) => acc + c.student_count, 0);
    const allProfessorIds = classes.flatMap(c => c.professors.map(p => p.id));
    const totalProfessors = new Set(allProfessorIds).size;
    
    return { activeClasses, totalStudents, totalProfessors };
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return {
    classes,
    loading,
    error,
    createClass,
    getClassStats,
    refetch: fetchClasses
  };
};