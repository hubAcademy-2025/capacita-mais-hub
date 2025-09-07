import { Calendar, Clock, Users, Video, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';

export const ProfessorEncontrosPage = () => {
  const { currentUser, classes, meetings, users } = useAppStore();

  if (!currentUser) return null;

  const professorClasses = classes.filter(c => c.professorId === currentUser.id);
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
          <p className="text-muted-foreground">Gerencie seus encontros e aulas ao vivo</p>
        </div>
        <Button onClick={() => alert('Funcionalidade de agendar encontro será implementada')}>
          <Plus className="w-4 h-4 mr-2" />
          Agendar Encontro
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">{upcomingMeetings.length}</p>
                <p className="text-sm text-muted-foreground">Próximos Encontros</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">{pastMeetings.length}</p>
                <p className="text-sm text-muted-foreground">Realizados</p>
              </div>
              <Video className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-warning">{professorClasses.length}</p>
                <p className="text-sm text-muted-foreground">Turmas Ativas</p>
              </div>
              <Users className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-accent">
                  {professorMeetings.reduce((acc, m) => acc + m.duration, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Min. Total</p>
              </div>
              <Clock className="w-8 h-8 text-accent" />
            </div>
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
              const classroom = getClassInfo(meeting.classId);
              const isToday = new Date(meeting.dateTime).toDateString() === new Date().toDateString();
              
              return (
                <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                      <Video className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{meeting.title}</h3>
                      <p className="text-sm text-muted-foreground">{classroom?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {classroom?.studentIds.length} alunos matriculados
                      </p>
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
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isToday && (
                      <Badge variant="destructive" className="mr-2">Hoje</Badge>
                    )}
                    <Button size="sm">
                      {isToday ? 'Iniciar' : 'Editar'}
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {upcomingMeetings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhum encontro agendado</h3>
                <p className="text-sm">Agende encontros para suas turmas.</p>
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
            Encontros Realizados ({pastMeetings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastMeetings.slice(0, 10).map((meeting) => {
              const classroom = getClassInfo(meeting.classId);
              
              return (
                <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg opacity-75">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Video className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{meeting.title}</h3>
                      <p className="text-sm text-muted-foreground">{classroom?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {classroom?.studentIds.length} alunos
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(meeting.dateTime).toLocaleDateString('pt-BR')}
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
                    <Button variant="outline" size="sm">
                      Ver Relatório
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
    </div>
  );
};