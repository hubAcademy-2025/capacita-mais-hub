import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Users, Clock, Video, Plus, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { CreateMeetingDialog } from '@/components/professor/CreateMeetingDialog';

export const ProfessorEncontrosPage = () => {
  const navigate = useNavigate();
  const { currentUser, classes, meetings, users } = useAppStore();

  if (!currentUser) return null;

  const professorClasses = classes.filter(c => 
    (c.professorIds && c.professorIds.includes(currentUser.id)) || 
    // @ts-ignore - backward compatibility
    c.professorId === currentUser.id
  );
  const professorMeetings = meetings.filter(m => 
    professorClasses.some(c => c.id === m.classId)
  ).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const upcomingMeetings = professorMeetings.filter(m => 
    new Date(m.dateTime) > new Date() && m.status === 'scheduled'
  );

  const pastMeetings = professorMeetings.filter(m => 
    new Date(m.dateTime) <= new Date() || m.status === 'completed'
  );

  const getClassInfo = (classId: string) => {
    return professorClasses.find(c => c.id === classId);
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
            <Link to="/professor/encontros/relatorios">
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
            <div className="text-2xl font-bold">
              {professorMeetings.reduce((acc, m) => acc + m.duration, 0)}
            </div>
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
              const classInfo = getClassInfo(meeting.classId);
              const isToday = new Date(meeting.dateTime).toDateString() === new Date().toDateString();
              
              return (
                <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                      <Video className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{meeting.title}</h3>
                      <p className="text-sm text-muted-foreground">{classInfo?.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(meeting.dateTime).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(meeting.dateTime).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} ({meeting.duration}min)
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {classInfo?.studentIds.length} alunos
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isToday && (
                      <Badge variant="destructive" className="mr-2">Hoje</Badge>
                    )}
                    <Button 
                      size="sm"
                      variant={isToday ? "default" : "outline"}
                      onClick={() => navigate(`/professor/meeting/${meeting.id}`)}
                      className={isToday ? "bg-success hover:bg-success/90" : ""}
                    >
                      {isToday ? 'Iniciar Encontro' : 'Ver Detalhes'}
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
            {pastMeetings.slice(0, 10).map((meeting) => {
              const classInfo = getClassInfo(meeting.classId);
              
              return (
                <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg opacity-75">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Video className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{meeting.title}</h3>
                      <p className="text-sm text-muted-foreground">{classInfo?.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(meeting.dateTime).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {meeting.duration}min
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {meeting.attendanceList?.length || 0} participantes
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Concluído</Badge>
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
    </div>
  );
};