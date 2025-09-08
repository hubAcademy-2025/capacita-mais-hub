import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Module {
  id: string;
  trail_id: string;
  title: string;
  description: string | null;
  order_index: number;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
  content_count?: number;
}

export const useModules = (trailId: string | null) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchModules = async () => {
    if (!trailId) return;
    
    try {
      setLoading(true);
      setError(null);

      // Get modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('trail_id', trailId)
        .order('order_index', { ascending: true });

      if (modulesError) throw modulesError;

      // Get content count per module
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select('id, module_id');

      if (contentError) throw contentError;

      // Add content count to modules
      const modulesWithCount = modulesData?.map(module => ({
        ...module,
        content_count: contentData?.filter(c => c.module_id === module.id).length || 0
      })) || [];

      setModules(modulesWithCount);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar módulos');
    } finally {
      setLoading(false);
    }
  };

  const createModule = async (moduleData: {
    title: string;
    description?: string;
    order_index: number;
  }) => {
    if (!trailId) return;

    try {
      const { data, error } = await supabase
        .from('modules')
        .insert([{
          trail_id: trailId,
          title: moduleData.title,
          description: moduleData.description,
          order_index: moduleData.order_index
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Módulo criado com sucesso!",
      });

      await fetchModules();
      return data;
    } catch (err) {
      console.error('Error creating module:', err);
      toast({
        title: "Erro",
        description: "Erro ao criar módulo",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateModule = async (moduleId: string, moduleData: {
    title: string;
    description?: string;
    order_index: number;
  }) => {
    try {
      const { error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', moduleId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Módulo atualizado com sucesso!",
      });

      await fetchModules();
    } catch (err) {
      console.error('Error updating module:', err);
      toast({
        title: "Erro",
        description: "Erro ao atualizar módulo",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteModule = async (moduleId: string) => {
    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Módulo removido com sucesso!",
      });

      await fetchModules();
    } catch (err) {
      console.error('Error deleting module:', err);
      toast({
        title: "Erro",
        description: "Erro ao remover módulo",
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchModules();
  }, [trailId]);

  return {
    modules,
    loading,
    error,
    createModule,
    updateModule,
    deleteModule,
    refetch: fetchModules
  };
};