import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { VideoMeetingRoom } from '@/components/video/VideoMeetingRoom';
import { useToast } from '@/components/ui/use-toast';
import { useMeetings } from '@/hooks/useMeetings';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useClasses } from '@/hooks/useClasses';

export const AlunoMeetingRoomPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { getMeetingById } = useMeetings();
  const { userProfile } = useSupabaseAuth();
  const { enrollments } = useEnrollments();
  const { classes } = useClasses();
  const { toast } = useToast();
  
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!meetingId) {
      navigate('/aluno/encontros');
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
      navigate('/aluno/encontros');
      return;
    }

    // Check if student is enrolled in the class
    if (userProfile) {
      const isEnrolled = enrollments.some(e => 
        e.student_id === userProfile.id && e.class_id === foundMeeting.class_id
      );
      
      if (!isEnrolled) {
        toast({
          title: "Acesso negado",
          description: "Você não está matriculado nesta turma",
          variant: "destructive",
        });
        navigate('/aluno/encontros');
        return;
      }
    }
  }, [meetingId, getMeetingById, navigate, userProfile, enrollments]);

  const handleLeaveMeeting = () => {
    toast({
      title: "Você saiu da reunião",
      description: "Obrigado por participar!",
    });
    navigate('/aluno/encontros');
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
            <Button onClick={() => navigate('/aluno/encontros')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Encontros
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const classInfo = classes.find(c => c.id === meeting.class_id);
  const isLive = meeting.status === 'live';
  const isScheduled = meeting.status === 'scheduled';
  const meetingTime = new Date(meeting.date_time);
  const now = new Date();
  const canJoin = isLive || (isScheduled && meetingTime <= now);

  if (!canJoin) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/aluno/encontros')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{meeting.title}</h1>
                <p className="text-muted-foreground">{classInfo?.name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <CardTitle>Reunião ainda não iniciada</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Esta reunião está agendada para {meetingTime.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-muted-foreground">
                Você poderá entrar quando o professor iniciar a reunião.
              </p>
              <Badge variant="outline">
                Agendado para {meetingTime.toLocaleTimeString('pt-BR')}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                onClick={() => navigate('/aluno/encontros')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{meeting.title}</h1>
                <p className="text-muted-foreground">
                  {classInfo?.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {meetingTime.toLocaleString('pt-BR')}
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
          onEndMeeting={handleLeaveMeeting}
        />
      </div>
    </div>
  );
};