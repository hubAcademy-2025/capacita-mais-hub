import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TrailWithDetails {
  id: string;
  title: string;
  description: string | null;
  level: string;
  duration: string | null;
  certificate_enabled: boolean;
  certificate_type: string;
  created_at: string;
  module_count: number;
  content_count: number;
  class_count: number;
}

export const useTrails = () => {
  const [trails, setTrails] = useState<TrailWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTrails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all trails
      const { data: trailsData, error: trailsError } = await supabase
        .from('trails')
        .select('*')
        .order('created_at', { ascending: false });

      if (trailsError) throw trailsError;

      // Get modules count per trail
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('id, trail_id');

      if (modulesError) throw modulesError;

      // Get content count per trail
      const { data: content, error: contentError } = await supabase
        .from('content')
        .select(`
          id,
          modules!inner (
            trail_id
          )
        `);

      if (contentError) throw contentError;

      // Get class trails to count usage
      const { data: classTrails, error: ctError } = await supabase
        .from('class_trails')
        .select('trail_id');

      if (ctError) throw ctError;

      // Transform data
      const trailsWithDetails = trailsData?.map(trail => {
        const moduleCount = modules?.filter(m => m.trail_id === trail.id).length || 0;
        const contentCount = content?.filter(c => c.modules.trail_id === trail.id).length || 0;
        const classCount = classTrails?.filter(ct => ct.trail_id === trail.id).length || 0;

        return {
          id: trail.id,
          title: trail.title,
          description: trail.description,
          level: trail.level,
          duration: trail.duration,
          certificate_enabled: trail.certificate_enabled || false,
          certificate_type: trail.certificate_type || 'trail',
          created_at: trail.created_at,
          module_count: moduleCount,
          content_count: contentCount,
          class_count: classCount
        };
      }) || [];

      setTrails(trailsWithDetails);
    } catch (err) {
      console.error('Error fetching trails:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar trilhas');
    } finally {
      setLoading(false);
    }
  };

  const createTrail = async (trailData: {
    title: string;
    description?: string;
    level: string;
    duration?: string;
    certificate_enabled?: boolean;
    certificate_type?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('trails')
        .insert([{
          title: trailData.title,
          description: trailData.description,
          level: trailData.level as any,
          duration: trailData.duration,
          certificate_enabled: trailData.certificate_enabled,
          certificate_type: trailData.certificate_type as any
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Trilha criada com sucesso!",
      });

      // Refresh data
      await fetchTrails();
      
      return data;
    } catch (err) {
      console.error('Error creating trail:', err);
      toast({
        title: "Erro",
        description: "Erro ao criar trilha",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateTrail = async (trailId: string, trailData: {
    title: string;
    description?: string;
    level: string;
    duration?: string;
    certificate_enabled?: boolean;
    certificate_type?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('trails')
        .update({
          title: trailData.title,
          description: trailData.description,
          level: trailData.level as any,
          duration: trailData.duration,
          certificate_enabled: trailData.certificate_enabled,
          certificate_type: trailData.certificate_type as any
        })
        .eq('id', trailId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Trilha atualizada com sucesso!",
      });

      // Refresh data
      await fetchTrails();
    } catch (err) {
      console.error('Error updating trail:', err);
      toast({
        title: "Erro",
        description: "Erro ao atualizar trilha",
        variant: "destructive",
      });
      throw err;
    }
  };

  const getTrailStats = () => {
    const totalModules = trails.reduce((acc, t) => acc + t.module_count, 0);
    const totalContent = trails.reduce((acc, t) => acc + t.content_count, 0);
    const activeTrails = trails.length; // All trails are considered active unless explicitly blocked
    
    return { totalModules, totalContent, activeTrails };
  };

  // Get trails for select options
  const getTrailOptions = () => {
    return trails.map(trail => ({
      id: trail.id,
      title: trail.title
    }));
  };

  useEffect(() => {
    fetchTrails();
  }, []);

  return {
    trails,
    loading,
    error,
    createTrail,
    updateTrail,
    getTrailStats,
    getTrailOptions,
    refetch: fetchTrails
  };
};