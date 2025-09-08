import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { VideoMeetingRoom } from '@/components/video/VideoMeetingRoom';
import { useToast } from '@/components/ui/use-toast';

export const AdminMeetingRoomPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { meetings, updateMeeting, classes, users } = useAppStore();
  const { toast } = useToast();
  const [meeting, setMeeting] = useState(() => 
    meetings.find(m => m.id === meetingId)
  );

  useEffect(() => {
    if (!meeting) {
      toast({
        title: "Erro",
        description: "Reunião não encontrada",
        variant: "destructive",
      });
      navigate('/admin');
      return;
    }

    // Update meeting status to live when room is accessed
    if (meeting.status === 'scheduled') {
      updateMeeting(meeting.id, { status: 'live' });
      setMeeting(prev => prev ? { ...prev, status: 'live' } : null);
    }
  }, [meeting, meetingId, navigate, updateMeeting]);

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

  if (!meeting) {
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

  const classInfo = classes.find(c => c.id === meeting.classId);
  const enrolledStudents = classInfo?.studentIds?.length || 0;
  const assignedProfessors = classInfo?.professorIds?.length || 0;

  const getParticipantText = () => {
    const parts = [];
    if (meeting.participantTypes.includes('students')) {
      parts.push(`${enrolledStudents} alunos`);
    }
    if (meeting.participantTypes.includes('professors')) {
      parts.push(`${assignedProfessors} professores`);
    }
    return parts.join(' + ');
  };

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
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{meeting.title}</h1>
                <p className="text-muted-foreground">
                  {classInfo?.name} • {getParticipantText()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(meeting.dateTime).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                  {meeting.attendanceList?.filter(a => !a.checkOutTime).length || 0} online
                </span>
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