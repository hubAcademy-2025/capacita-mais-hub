import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Users, Clock, Video, Plus, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreateMeetingDialog } from '@/components/professor/CreateMeetingDialog';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useClasses } from '@/hooks/useClasses';
import { useMeetings } from '@/hooks/useMeetings';

export const ProfessorEncontrosPage = () => {
  const navigate = useNavigate();
  const { userProfile } = useSupabaseAuth();
  const { classes } = useClasses();
  const { meetings } = useMeetings();

  if (!userProfile) return null;

  // Get professor's classes (admin can see all)
  const professorClasses = userProfile.roles?.includes('admin') 
    ? classes
    : classes.filter(c => c.professors.some(p => p.id === userProfile.id));

  const professorClassIds = professorClasses.map(c => c.id);
  
  // Filter meetings for professor's classes
  const professorMeetings = meetings.filter(m => professorClassIds.includes(m.class_id));
  
  const now = new Date();
  const upcomingMeetings = professorMeetings.filter(m => new Date(m.date_time) > now);
  const pastMeetings = professorMeetings.filter(m => new Date(m.date_time) <= now);
  
  // Calculate total duration
  const totalDuration = professorMeetings.reduce((sum, meeting) => sum + (meeting.duration || 0), 0);

  console.log('=== PROFESSOR ENCONTROS DEBUG ===');
  console.log('User Profile:', userProfile);
  console.log('User Profile ID:', userProfile?.id);
  console.log('User Profile roles:', userProfile?.roles);
  console.log('All meetings from hook:', meetings);
  console.log('All classes:', classes);
  console.log('Professor classes:', professorClasses);
  console.log('Professor class IDs:', professorClassIds);
  console.log('Professor meetings (filtered):', professorMeetings);
  console.log('Meetings class_ids:', meetings.map(m => ({ id: m.id, class_id: m.class_id, title: m.title })));
  console.log('Upcoming meetings:', upcomingMeetings);
  console.log('Past meetings:', pastMeetings);
  console.log('Current time:', now.toISOString());

  const getClassInfo = (classId: string) => {
    const classroom = professorClasses.find(c => c.id === classId);
    return { classroom };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Encontros</h1>
          <p className="text-muted-foreground">Gerencie seus encontros e acompanhe a participação</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/professor/relatorios/frequencia">
              <BarChart className="w-4 h-4 mr-2" />
              Relatórios
            </Link>
          </Button>
          <CreateMeetingDialog>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agendar Encontro
            </Button>
          </CreateMeetingDialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Encontros</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
            <p className="text-xs text-muted-foreground">Encontros agendados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encontros Realizados</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastMeetings.length}</div>
            <p className="text-xs text-muted-foreground">Já concluídos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turmas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{professorClasses.length}</div>
            <p className="text-xs text-muted-foreground">Suas turmas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duração Total</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDuration}</div>
            <p className="text-xs text-muted-foreground">Minutos de encontros</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Próximos Encontros ({upcomingMeetings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => {
              const { classroom } = getClassInfo(meeting.class_id);
              const isToday = new Date(meeting.date_time).toDateString() === new Date().toDateString();
              const isLive = meeting.status === 'live';
              
              return (
                <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isLive ? 'bg-red-100 animate-pulse' : 'bg-primary/10'
                    }`}>
                      <Video className={`w-6 h-6 ${isLive ? 'text-red-600' : 'text-primary'}`} />
                    </div>
                    <div>
                      <h3 className="font-medium">{meeting.title}</h3>
                      <p className="text-sm text-muted-foreground">{classroom?.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(meeting.date_time).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(meeting.date_time).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} ({meeting.duration}min)
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLive && (
                      <Badge variant="destructive" className="mr-2 bg-red-500">AO VIVO</Badge>
                    )}
                    {isToday && !isLive && (
                      <Badge variant="destructive" className="mr-2">Hoje</Badge>
                    )}
                    <Button 
                      size="sm"
                      variant={isLive || isToday ? "default" : "outline"}
                      onClick={() => navigate(`/professor/meeting/${meeting.id}`)}
                      className={isLive ? "bg-red-500 hover:bg-red-600" : isToday ? "bg-success hover:bg-success/90" : ""}
                    >
                      {isLive ? 'Entrar AO VIVO' : isToday ? 'Entrar' : 'Gerenciar'}
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {upcomingMeetings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhum encontro agendado</h3>
                <p className="text-sm">Agende um encontro para suas turmas.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Past Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Encontros Realizados ({pastMeetings.length > 10 ? '10+' : pastMeetings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastMeetings.slice(0, 5).map((meeting) => {
              const { classroom } = getClassInfo(meeting.class_id);
              
              return (
                <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg opacity-75">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Video className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{meeting.title}</h3>
                      <p className="text-sm text-muted-foreground">{classroom?.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(meeting.date_time).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {meeting.duration}min
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Concluído</Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/professor/meeting/${meeting.id}`)}
                    >
                      Detalhes
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {pastMeetings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhum encontro realizado</h3>
                <p className="text-sm">Seus encontros anteriores aparecerão aqui.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* No Classes State */}
      {professorClasses.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Nenhuma turma atribuída</h3>
            <p className="text-sm text-muted-foreground">
              Aguarde a atribuição de turmas pelo administrador para poder agendar encontros.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};