import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Clock, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useMeetings } from '@/hooks/useMeetings';
import { VideoMeetingRoom } from '@/components/video/VideoMeetingRoom';
import { useToast } from '@/components/ui/use-toast';

export const AdminMeetingRoomPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { classes, users } = useAppStore();
  const { getMeetingById, updateMeeting, loading } = useMeetings();
  const { toast } = useToast();
  const [meeting, setMeeting] = useState(() => 
    getMeetingById(meetingId || '')
  );

  useEffect(() => {
    if (!meetingId) {
      toast({
        title: "Erro",
        description: "ID da reunião não fornecido",
        variant: "destructive",
      });
      navigate('/admin/meetings');
      return;
    }

    if (!loading) {
      const foundMeeting = getMeetingById(meetingId);
      setMeeting(foundMeeting);
      
      if (!foundMeeting) {
        toast({
          title: "Erro",
          description: "Reunião não encontrada",
          variant: "destructive",
        });
        navigate('/admin/meetings');
        return;
      }

      // Update meeting status to live when room is accessed
      if (foundMeeting.status === 'scheduled') {
        updateMeeting(foundMeeting.id, { status: 'live' });
      }
    }
  }, [meetingId, loading, getMeetingById, updateMeeting, navigate, toast]);

  const handleEndMeeting = () => {
    if (meeting) {
      updateMeeting(meeting.id, { status: 'completed' });
      toast({
        title: "Reunião encerrada",
        description: "A reunião foi encerrada com sucesso",
      });
    }
    navigate('/admin');
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando reunião...</p>
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
            <Button onClick={() => navigate('/admin/meetings')}>
              Voltar aos Encontros
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const classInfo = classes.find(c => c.id === meeting.class_id);
  const enrolledStudents = classInfo?.studentIds?.length || 0;
  const assignedProfessors = classInfo?.professorIds?.length || 0;

  const getParticipantText = () => {
    return `${enrolledStudents} participantes`;
  };

  // Convert MeetingWithClass to Meeting format for VideoMeetingRoom
  const adaptedMeeting = meeting ? {
    id: meeting.id,
    classId: meeting.class_id,
    title: meeting.title,
    dateTime: meeting.date_time,
    duration: meeting.duration,
    description: meeting.description,
    status: meeting.status,
    meetingUrl: meeting.meeting_url,
    hostUserId: meeting.host_user_id || '',
    maxParticipants: meeting.max_participants,
    attendanceList: [] as any[], // Initialize empty for now
    participantTypes: ['students', 'professors'] as ('students' | 'professors')[]
  } : null;

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
                onClick={() => navigate('/admin/meetings')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos Encontros
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{meeting.title}</h1>
                <p className="text-muted-foreground">
                  {meeting.class?.name} • {getParticipantText()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(meeting.date_time).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-sm">0 online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Room */}
      <div className="container mx-auto px-4 py-6">
        {adaptedMeeting && (
          <VideoMeetingRoom
            meeting={adaptedMeeting}
            onEndMeeting={handleEndMeeting}
            onAttendanceUpdate={handleAttendanceUpdate}
          />
        )}
      </div>
    </div>
  );
};