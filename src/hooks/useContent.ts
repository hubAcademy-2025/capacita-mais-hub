import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContentItem {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  type: 'video' | 'pdf' | 'quiz' | 'live';
  url: string | null;
  duration: string | null;
  order_index: number;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export const useContent = (moduleId: string | null) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchContent = async () => {
    if (!moduleId) return;
    
    try {
      setLoading(true);
      setError(null);

      const { data, error: contentError } = await supabase
        .from('content')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (contentError) throw contentError;

      setContent(data || []);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  const createContent = async (contentData: {
    title: string;
    description?: string;
    type: 'video' | 'pdf' | 'quiz' | 'live';
    url?: string;
    duration?: string;
    order_index: number;
  }) => {
    if (!moduleId) return;

    try {
      const { data, error } = await supabase
        .from('content')
        .insert([{
          module_id: moduleId,
          title: contentData.title,
          description: contentData.description,
          type: contentData.type,
          url: contentData.url,
          duration: contentData.duration,
          order_index: contentData.order_index
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conteúdo criado com sucesso!",
      });

      await fetchContent();
      return data;
    } catch (err) {
      console.error('Error creating content:', err);
      toast({
        title: "Erro",
        description: "Erro ao criar conteúdo",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateContent = async (contentId: string, contentData: {
    title: string;
    description?: string;
    type: 'video' | 'pdf' | 'quiz' | 'live';
    url?: string;
    duration?: string;
    order_index: number;
  }) => {
    try {
      const { error } = await supabase
        .from('content')
        .update(contentData)
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conteúdo atualizado com sucesso!",
      });

      await fetchContent();
    } catch (err) {
      console.error('Error updating content:', err);
      toast({
        title: "Erro",
        description: "Erro ao atualizar conteúdo",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conteúdo removido com sucesso!",
      });

      await fetchContent();
    } catch (err) {
      console.error('Error deleting content:', err);
      toast({
        title: "Erro",
        description: "Erro ao remover conteúdo",
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchContent();
  }, [moduleId]);

  return {
    content,
    loading,
    error,
    createContent,
    updateContent,
    deleteContent,
    refetch: fetchContent
  };
};