import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Clock, Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Meeting, MeetingAttendance } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface VideoMeetingRoomProps {
  meeting: Meeting;
  onEndMeeting?: () => void;
  onAttendanceUpdate?: (attendance: MeetingAttendance[]) => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const VideoMeetingRoom: React.FC<VideoMeetingRoomProps> = ({
  meeting,
  onEndMeeting,
  onAttendanceUpdate
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [participants, setParticipants] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<MeetingAttendance[]>([]);
  const { currentUser, users, updateMeeting } = useAppStore();
  const { toast } = useToast();

  useEffect(() => {
    // Load Jitsi Meet API
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      console.log('Jitsi script loaded successfully');
      initializeJitsi();
    };
    script.onerror = (error) => {
      console.error('Failed to load Jitsi script:', error);
      toast({
        title: "Erro ao carregar video conferência",
        description: "Não foi possível carregar o sistema de videoconferência. Verifique sua conexão com a internet.",
        variant: "destructive",
      });
    };
    document.head.appendChild(script);

    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
      // Clean up scripts
      const scripts = document.querySelectorAll('script[src*="external_api.js"]');
      scripts.forEach(s => s.remove());
    };
  }, []);

  const initializeJitsi = () => {
    console.log('Initializing Jitsi...');
    if (!jitsiContainerRef.current || !currentUser) {
      console.error('Missing container or user:', { 
        container: !!jitsiContainerRef.current, 
        currentUser: !!currentUser 
      });
      return;
    }

    const roomName = `meeting-${meeting.id}`;
    const options = {
      roomName,
      width: '100%',
      height: 500,
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: currentUser.name,
        email: currentUser.email,
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        disableModeratorIndicator: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
          'mute-video-everyone', 'security'
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
      }
    };

    try {
      console.log('Creating JitsiMeetExternalAPI with options:', options);
      const api = new window.JitsiMeetExternalAPI('meet.jit.si', options);
      setJitsiApi(api);
      console.log('Jitsi API created successfully');

      // Event listeners
      api.addEventListener('participantJoined', handleParticipantJoined);
      api.addEventListener('participantLeft', handleParticipantLeft);
      api.addEventListener('videoConferenceJoined', handleConferenceJoined);
      api.addEventListener('videoConferenceLeft', handleConferenceLeft);
      api.addEventListener('readyToClose', handleReadyToClose);

      // Auto check-in current user
      handleCheckIn(currentUser.id);
    } catch (error) {
      console.error('Failed to initialize Jitsi API:', error);
      toast({
        title: "Erro ao inicializar videoconferência",
        description: "Não foi possível conectar com o servidor de videoconferência",
        variant: "destructive",
      });
    }
  };

  const handleParticipantJoined = (event: any) => {
    console.log('Participant joined:', event);
    setParticipants(prev => [...prev, event]);
    
    // Try to find user by display name or email
    const user = users.find(u => 
      u.name === event.displayName || 
      u.email === event.email
    );
    
    if (user) {
      handleCheckIn(user.id);
    }
  };

  const handleParticipantLeft = (event: any) => {
    console.log('Participant left:', event);
    setParticipants(prev => prev.filter(p => p.id !== event.id));
    
    // Try to find user by display name or email
    const user = users.find(u => 
      u.name === event.displayName || 
      u.email === event.email
    );
    
    if (user) {
      handleCheckOut(user.id);
    }
  };

  const handleConferenceJoined = () => {
    console.log('Conference joined');
    if (currentUser) {
      handleCheckIn(currentUser.id);
    }
  };

  const handleConferenceLeft = () => {
    console.log('Conference left');
    if (currentUser) {
      handleCheckOut(currentUser.id);
    }
  };

  const handleReadyToClose = () => {
    onEndMeeting?.();
  };

  const handleCheckIn = (userId: string) => {
    const now = new Date().toISOString();
    const existingAttendance = attendanceData.find(a => a.userId === userId);
    
    if (!existingAttendance) {
      const newAttendance: MeetingAttendance = {
        meetingId: meeting.id,
        userId,
        checkInTime: now,
        status: 'present'
      };
      
      setAttendanceData(prev => [...prev, newAttendance]);
      
      const user = users.find(u => u.id === userId);
      toast({
        title: "Participante entrou",
        description: `${user?.name || 'Usuário'} entrou na reunião`,
      });
    }
  };

  const handleCheckOut = (userId: string) => {
    const now = new Date().toISOString();
    
    setAttendanceData(prev => 
      prev.map(attendance => {
        if (attendance.userId === userId && !attendance.checkOutTime) {
          const duration = Math.round(
            (new Date(now).getTime() - new Date(attendance.checkInTime).getTime()) / (1000 * 60)
          );
          
          return {
            ...attendance,
            checkOutTime: now,
            duration
          };
        }
        return attendance;
      })
    );
    
    const user = users.find(u => u.id === userId);
    toast({
      title: "Participante saiu",
      description: `${user?.name || 'Usuário'} saiu da reunião`,
    });
  };

  const toggleVideo = () => {
    if (jitsiApi) {
      if (isVideoOn) {
        jitsiApi.executeCommand('toggleVideo');
      } else {
        jitsiApi.executeCommand('toggleVideo');
      }
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleMic = () => {
    if (jitsiApi) {
      if (isMicOn) {
        jitsiApi.executeCommand('toggleAudio');
      } else {
        jitsiApi.executeCommand('toggleAudio');
      }
      setIsMicOn(!isMicOn);
    }
  };

  const endMeeting = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('hangup');
    }
    
    // Final check-out for all participants
    attendanceData.forEach(attendance => {
      if (!attendance.checkOutTime) {
        handleCheckOut(attendance.userId);
      }
    });

    // Update meeting status
    updateMeeting(meeting.id, { 
      status: 'completed',
      attendanceList: attendanceData
    });

    onAttendanceUpdate?.(attendanceData);
    onEndMeeting?.();
  };

  const getAttendingUsers = () => {
    const currentAttendees = attendanceData
      .filter(a => !a.checkOutTime)
      .map(a => users.find(u => u.id === a.userId))
      .filter(Boolean);
    
    return currentAttendees;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Meeting Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{meeting.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Iniciado em {new Date(meeting.dateTime).toLocaleString()}
              </p>
            </div>
            <Badge variant="default" className="bg-green-500">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
              AO VIVO
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Video Conference */}
      <Card>
        <CardContent className="p-0">
          <div ref={jitsiContainerRef} className="w-full min-h-[500px] rounded-lg overflow-hidden" />
        </CardContent>
      </Card>

      {/* Meeting Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant={isMicOn ? "default" : "destructive"}
                size="sm"
                onClick={toggleMic}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button
                variant={isVideoOn ? "default" : "destructive"}
                size="sm"
                onClick={toggleVideo}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
            </div>
            
            <Button variant="destructive" onClick={endMeeting}>
              <PhoneOff className="w-4 h-4 mr-2" />
              Encerrar Reunião
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participantes ({getAttendingUsers().length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getAttendingUsers().map((user) => {
              const attendance = attendanceData.find(a => a.userId === user?.id);
              return (
                <div key={user?.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {attendance ? new Date(attendance.checkInTime).toLocaleTimeString() : '--'}
                    </span>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Online
                    </Badge>
                  </div>
                </div>
              );
            })}
            
            {getAttendingUsers().length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Nenhum participante online no momento
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};