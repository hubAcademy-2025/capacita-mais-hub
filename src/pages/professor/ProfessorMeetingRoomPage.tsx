import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Clock, AlertCircle } from 'lucide-react';
import { VideoMeetingRoom } from '@/components/video/VideoMeetingRoom';
import { useToast } from '@/components/ui/use-toast';
import { useMeetings } from '@/hooks/useMeetings';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useClasses } from '@/hooks/useClasses';

export const ProfessorMeetingRoomPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { getMeetingById, updateMeeting } = useMeetings();
  const { userProfile } = useSupabaseAuth();
  const { classes } = useClasses();
  const { toast } = useToast();
  
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!meetingId) {
      navigate('/professor/encontros');
      return;
    }

    const foundMeeting = getMeetingById(meetingId);
    setMeeting(foundMeeting);
    setLoading(false);

    if (!foundMeeting) {
      toast({
        title: "Erro",
        description: "Reunião não encontrada",
        variant: "destructive",
      });
      navigate('/professor/encontros');
      return;
    }

    // Check if user has permission to access this meeting
    if (userProfile && !userProfile.roles?.includes('admin')) {
      const userClasses = classes.filter(c => 
        c.professors.some(p => p.id === userProfile.id)
      );
      const hasAccess = userClasses.some(c => c.id === foundMeeting.class_id);
      
      if (!hasAccess) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta reunião",
          variant: "destructive",
        });
        navigate('/professor/encontros');
        return;
      }
    }

    // Update meeting status to live when room is accessed
    if (foundMeeting.status === 'scheduled') {
      updateMeeting(foundMeeting.id, { status: 'live' });
      setMeeting(prev => prev ? { ...prev, status: 'live' } : null);
    }
  }, [meetingId, getMeetingById, navigate, userProfile, classes, updateMeeting]);

  const handleEndMeeting = async () => {
    if (meeting) {
      try {
        await updateMeeting(meeting.id, { status: 'completed' });
        toast({
          title: "Reunião encerrada",
          description: "A reunião foi encerrada com sucesso",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao encerrar reunião",
          variant: "destructive",
        });
      }
    }
    navigate('/professor/encontros');
  };

  const handleAttendanceUpdate = (attendanceData: any[]) => {
    console.log('Attendance updated:', attendanceData);
    // Additional attendance processing can be done here
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Carregando reunião...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Reunião não encontrada</h3>
            <p className="text-muted-foreground mb-4">
              A reunião que você está tentando acessar não foi encontrada.
            </p>
            <Button onClick={() => navigate('/professor/encontros')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Encontros
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const classInfo = classes.find(c => c.id === meeting.class_id);
  const enrolledStudents = classInfo?.student_count || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/professor/encontros')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{meeting.title}</h1>
                <p className="text-muted-foreground">
                  {classInfo?.name} • {enrolledStudents} alunos matriculados
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(meeting.date_time).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-sm">Duração: {meeting.duration}min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Room */}
      <div className="container mx-auto px-4 py-6">
        <VideoMeetingRoom
          meeting={meeting}
          onEndMeeting={handleEndMeeting}
          onAttendanceUpdate={handleAttendanceUpdate}
        />
      </div>
    </div>
  );
};