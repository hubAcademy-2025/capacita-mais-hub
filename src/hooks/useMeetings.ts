import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date_time: string;
  duration: number;
  class_id: string;
  host_user_id?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  meeting_url?: string;
  max_participants?: number;
  created_at: string;
  updated_at: string;
}

export interface MeetingWithClass extends Meeting {
  class: {
    id: string;
    name: string;
  } | null;
}

export const useMeetings = () => {
  const [meetings, setMeetings] = useState<MeetingWithClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: meetingError } = await supabase
        .from('meetings')
        .select(`
          *,
          class:classes!inner(
            id,
            name
          )
        `)
        .order('date_time', { ascending: true });

      console.log('=== MEETINGS FETCH DEBUG ===');
      console.log('Raw meetings data:', data);
      console.log('Meeting error:', meetingError);

      if (meetingError) throw meetingError;

      const meetingsWithClass = data?.map(meeting => ({
        ...meeting,
        class: meeting.classes
      })) || [];

      console.log('Processed meetings:', meetingsWithClass);
      setMeetings(meetingsWithClass);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar encontros');
    } finally {
      setLoading(false);
    }
  };

  const createMeeting = async (meetingData: {
    title: string;
    description?: string;
    date_time: string;
    duration: number;
    class_id: string;
    max_participants?: number;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('meetings')
        .insert([{ 
          ...meetingData,
          host_user_id: user.id,
          status: 'scheduled'
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Encontro criado com sucesso!",
      });

      await fetchMeetings();
    } catch (err) {
      console.error('Error creating meeting:', err);
      toast({
        title: "Erro",
        description: "Erro ao criar encontro",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateMeeting = async (meetingId: string, meetingData: Partial<Meeting>) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .update(meetingData)
        .eq('id', meetingId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Encontro atualizado com sucesso!",
      });

      await fetchMeetings();
    } catch (err) {
      console.error('Error updating meeting:', err);
      toast({
        title: "Erro",
        description: "Erro ao atualizar encontro",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteMeeting = async (meetingId: string) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Encontro removido com sucesso!",
      });

      await fetchMeetings();
    } catch (err) {
      console.error('Error deleting meeting:', err);
      toast({
        title: "Erro",
        description: "Erro ao remover encontro",
        variant: "destructive",
      });
      throw err;
    }
  };

  const getMeetingsByClassId = (classId: string) => {
    return meetings.filter(m => m.class_id === classId);
  };

  const getMeetingById = (meetingId: string) => {
    return meetings.find(m => m.id === meetingId);
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return {
    meetings,
    loading,
    error,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    getMeetingsByClassId,
    getMeetingById,
    refetch: fetchMeetings
  };
};