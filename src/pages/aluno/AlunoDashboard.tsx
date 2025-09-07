import { Play, Calendar, Trophy, BookOpen, CheckCircle } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { Link } from 'react-router-dom';

export const AlunoDashboard = () => {
  const { 
    currentUser, 
    getStudentEnrollment, 
    classes, 
    trails, 
    meetings,
    users 
  } = useAppStore();
  
  const enrollment = currentUser ? getStudentEnrollment(currentUser.id) : null;
  const myClass = enrollment ? classes.find(c => c.id === enrollment.classId) : null;
  const myTrail = myClass ? trails.find(t => 
    myClass.trailIds?.includes(t.id) || 
    // @ts-ignore - backward compatibility
    myClass.trailId === t.id
  ) : null;
  const professor = myClass ? users.find(u => 
    myClass.professorIds?.includes(u.id) || 
    // @ts-ignore - backward compatibility
    myClass.professorId === u.id
  ) : null;
  
  const upcomingMeetings = myClass ? 
    meetings.filter(m => 
      m.classId === myClass.id && 
      new Date(m.dateTime) > new Date() && 
      m.status === 'scheduled'
    ).slice(0, 3) : [];

  const totalModules = myTrail?.modules.length || 0;
  const completedModules = Math.floor((enrollment?.progress || 0) / 100 * totalModules);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-primary text-primary-foreground rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Olá, {currentUser?.name}! 👋
            </h2>
            <p className="text-primary-foreground/80 mb-4">
              Continue seu aprendizado onde parou
            </p>
            {myTrail && (
              <Button asChild variant="secondary">
                <Link to="/aluno/trilha">
                  <Play className="w-4 h-4 mr-2" />
                  Continuar Aprendendo
                </Link>
              </Button>
            )}
          </div>
          
          {enrollment && (
            <div className="text-right">
              <p className="text-3xl font-bold">{enrollment.progress}%</p>
              <p className="text-primary-foreground/80">Progresso Geral</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Progresso da Trilha"
          value={`${enrollment?.progress || 0}%`}
          icon={BookOpen}
        />
        <StatsCard
          title="Módulos Concluídos"
          value={`${completedModules}/${totalModules}`}
          icon={CheckCircle}
        />
        <StatsCard
          title="Próximos Encontros"
          value={upcomingMeetings.length}
          icon={Calendar}
        />
        <StatsCard
          title="Pontuação"
          value={enrollment?.finalGrade || 'N/A'}
          icon={Trophy}
        />
      </div>

      {/* Current Learning Path */}
      {myTrail && (
        <Card>
          <CardHeader>
            <CardTitle>Minha Trilha de Aprendizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{myTrail.title}</h3>
                  <p className="text-muted-foreground mt-1">{myTrail.description}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Professor: {professor?.name} • Turma: {myClass?.name}
                  </p>
                </div>
                <Badge variant="secondary">{myTrail.level}</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{enrollment?.progress}%</span>
                </div>
                <Progress value={enrollment?.progress} className="h-2" />
              </div>
              
              <Button asChild className="w-full">
                <Link to="/aluno/trilha">
                  <Play className="w-4 h-4 mr-2" />
                  Continuar Trilha
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Meetings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Próximos Encontros</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/aluno/encontros">Ver Todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{meeting.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(meeting.dateTime).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(meeting.dateTime).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Duração: {meeting.duration} minutos
                      </p>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    Participar
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum encontro agendado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};