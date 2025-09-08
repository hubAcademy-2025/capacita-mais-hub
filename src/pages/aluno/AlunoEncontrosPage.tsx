import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';

export const AlunoEncontrosPage = () => {
  const navigate = useNavigate();
  const { currentUser, classes, enrollments, meetings, users } = useAppStore();

  if (!currentUser) return null;

  const studentEnrollments = enrollments.filter(e => e.studentId === currentUser.id);
  const studentClasses = classes.filter(c => studentEnrollments.some(e => e.classId === c.id));
  
  const allMeetings = meetings.filter(m => 
    studentClasses.some(c => c.id === m.classId)
  ).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const upcomingMeetings = allMeetings.filter(m => 
    (new Date(m.dateTime) > new Date() && m.status === 'scheduled') ||
    (m.status === 'live')
  );

  const pastMeetings = allMeetings.filter(m => 
    (new Date(m.dateTime) <= new Date() && m.status === 'scheduled') || 
    m.status === 'completed'
  );

  const getClassInfo = (classId: string) => {
    const classroom = studentClasses.find(c => c.id === classId);
    const professor = classroom ? users.find(u => 
      classroom.professorIds?.includes(u.id) || 
      // @ts-ignore - backward compatibility
      classroom.professorId === u.id
    ) : null;
    return { classroom, professor };
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meus Encontros</h1>
        <p className="text-muted-foreground">Acompanhe suas aulas ao vivo e gravações</p>
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
              const { classroom, professor } = getClassInfo(meeting.classId);
              const isToday = new Date(meeting.dateTime).toDateString() === new Date().toDateString();
              const isLive = meeting.status === 'live';
              
              return (
                <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isLive ? 'bg-red-100 animate-pulse' : 'bg-primary-light'
                    }`}>
                      <Video className={`w-6 h-6 ${isLive ? 'text-red-600' : 'text-primary'}`} />
                    </div>
                    <div>
                      <h3 className="font-medium">{meeting.title}</h3>
                      <p className="text-sm text-muted-foreground">{classroom?.name}</p>
                      <p className="text-sm text-muted-foreground">Professor: {professor?.name}</p>
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
                    {isLive && (
                      <Badge variant="destructive" className="mr-2 bg-red-500">AO VIVO</Badge>
                    )}
                    {isToday && !isLive && (
                      <Badge variant="destructive" className="mr-2">Hoje</Badge>
                    )}
                    <Button 
                      size="sm"
                      variant={isLive || isToday ? "default" : "outline"}
                      onClick={() => navigate(`/aluno/meeting/${meeting.id}`)}
                      className={isLive ? "bg-red-500 hover:bg-red-600" : isToday ? "bg-success hover:bg-success/90" : ""}
                    >
                      {isLive ? 'Entrar AO VIVO' : isToday ? 'Entrar' : 'Detalhes'}
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {upcomingMeetings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhum encontro agendado</h3>
                <p className="text-sm">Não há encontros programados para suas turmas.</p>
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
            Encontros Anteriores ({pastMeetings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastMeetings.slice(0, 5).map((meeting) => {
              const { classroom, professor } = getClassInfo(meeting.classId);
              
              return (
                <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg opacity-75">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Video className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{meeting.title}</h3>
                      <p className="text-sm text-muted-foreground">{classroom?.name}</p>
                      <p className="text-sm text-muted-foreground">Professor: {professor?.name}</p>
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
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => navigate(`/aluno/meeting/${meeting.id}`)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Entrar
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {pastMeetings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhum encontro anterior</h3>
                <p className="text-sm">Suas aulas anteriores aparecerão aqui.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};