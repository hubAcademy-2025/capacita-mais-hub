import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Video, MoreHorizontal, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CreateMeetingDialog } from '@/components/admin/CreateMeetingDialog';
import { useMeetings } from '@/hooks/useMeetings';
import { useClasses } from '@/hooks/useClasses';
import { format, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export const AdminMeetingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { meetings, updateMeeting } = useMeetings();
  const { classes } = useClasses();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'completed'>('all');

  const now = new Date();
  
  const upcomingMeetings = meetings.filter(m => 
    m.status === 'scheduled' && isAfter(new Date(m.date_time), now)
  );
  
  const liveMeetings = meetings.filter(m => m.status === 'live');
  
  const completedMeetings = meetings.filter(m => 
    m.status === 'completed' || 
    (m.status === 'scheduled' && isBefore(new Date(m.date_time), now))
  );

  const filteredMeetings = () => {
    switch (filter) {
      case 'upcoming':
        return upcomingMeetings;
      case 'live':
        return liveMeetings;
      case 'completed':
        return completedMeetings;
      default:
        return meetings;
    }
  };

  const handleStartMeeting = async (meetingId: string) => {
    try {
      await updateMeeting(meetingId, { status: 'live' });
      toast({
        title: "Encontro iniciado",
        description: "O encontro foi iniciado com sucesso.",
      });
      navigate(`/admin/meeting-room/${meetingId}`);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o encontro.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (meeting: any) => {
    const meetingTime = new Date(meeting.date_time);
    
    if (meeting.status === 'live') {
      return <Badge className="bg-red-500 hover:bg-red-600">Ao Vivo</Badge>;
    }
    
    if (meeting.status === 'completed') {
      return <Badge variant="secondary">Concluído</Badge>;
    }
    
    if (isAfter(meetingTime, now)) {
      return <Badge variant="outline">Agendado</Badge>;
    }
    
    return <Badge variant="destructive">Expirado</Badge>;
  };

  const getClassInfo = (classId: string) => {
    return classes.find(c => c.id === classId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Encontros</h1>
          <p className="text-muted-foreground">Gerencie e acompanhe todos os encontros</p>
        </div>
        <CreateMeetingDialog>
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            Agendar Encontro
          </Button>
        </CreateMeetingDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Próximos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ao Vivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{liveMeetings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMeetings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetings.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          Todos
        </Button>
        <Button
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          onClick={() => setFilter('upcoming')}
          size="sm"
        >
          Próximos ({upcomingMeetings.length})
        </Button>
        <Button
          variant={filter === 'live' ? 'default' : 'outline'}
          onClick={() => setFilter('live')}
          size="sm"
        >
          Ao Vivo ({liveMeetings.length})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
          size="sm"
        >
          Concluídos ({completedMeetings.length})
        </Button>
      </div>

      {/* Meetings List */}
      <div className="grid gap-4">
        {filteredMeetings().length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Video className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum encontro encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                {filter === 'all' 
                  ? 'Não há encontros agendados ainda.'
                  : `Não há encontros ${filter === 'upcoming' ? 'próximos' : filter === 'live' ? 'ao vivo' : 'concluídos'}.`
                }
              </p>
              <CreateMeetingDialog>
                <Button>Agendar Primeiro Encontro</Button>
              </CreateMeetingDialog>
            </CardContent>
          </Card>
        ) : (
          filteredMeetings().map((meeting) => {
            const classInfo = getClassInfo(meeting.class_id);
            const meetingTime = new Date(meeting.date_time);
            const isUpcoming = meeting.status === 'scheduled' && isAfter(meetingTime, now);
            const canStart = isUpcoming || meeting.status === 'live';

            return (
              <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{meeting.title}</h3>
                        {getStatusBadge(meeting)}
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(meetingTime, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {format(meetingTime, 'HH:mm')} • {meeting.duration} min
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>Turma: {classInfo?.name || 'Turma não encontrada'}</span>
                        </div>
                        
                        {meeting.description && (
                          <p className="mt-2">{meeting.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {canStart && (
                        <Button
                          onClick={() => handleStartMeeting(meeting.id)}
                          variant={meeting.status === 'live' ? 'default' : 'outline'}
                          size="sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {meeting.status === 'live' ? 'Entrar' : 'Iniciar'}
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/admin/classes/${meeting.class_id}`)}
                          >
                            Ver Turma
                          </DropdownMenuItem>
                          {meeting.status === 'completed' && (
                            <DropdownMenuItem
                              onClick={() => navigate(`/admin/meeting-reports/${meeting.id}`)}
                            >
                              Relatório
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};