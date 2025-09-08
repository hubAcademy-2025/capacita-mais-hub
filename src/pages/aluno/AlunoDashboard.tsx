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
  // Get all available trails for student
  const studentEnrollments = currentUser ? enrollment ? [enrollment] : [] : [];
  const studentClasses = classes.filter(c => studentEnrollments.some(e => e.classId === c.id));
  const allStudentTrails = trails.filter(t => 
    studentClasses.some(c => 
      (c.trailIds && c.trailIds.includes(t.id)) || 
      c.trailId === t.id
    )
  );
  
  // Handle multiple trails for a class
  const myTrails = myClass && myClass.trailIds ? 
    trails.filter(t => myClass.trailIds.includes(t.id)) : 
    myClass && myClass.trailId ? 
    trails.filter(t => t.id === myClass.trailId) : [];
  const myTrail = myTrails[0] || null;
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
    <div className="p-6 space-y-6 animate-fade-in">
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
                <Link to="/aluno/trilhas">
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

      {/* All Available Trails */}
      {allStudentTrails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suas Trilhas de Aprendizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allStudentTrails.slice(0, 4).map((trail) => {
                const trailClass = studentClasses.find(c => 
                  (c.trailIds && c.trailIds.includes(trail.id)) || c.trailId === trail.id
                );
                const trailEnrollment = trailClass ? studentEnrollments.find(e => e.classId === trailClass.id) : null;
                
                return (
                  <div key={trail.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium">{trail.title}</h3>
                        <p className="text-sm text-muted-foreground">{trail.description}</p>
                        <Badge variant="outline" className="mt-1 text-xs">{trail.level}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{trailEnrollment?.progress || 0}%</p>
                        <Progress value={trailEnrollment?.progress || 0} className="w-16 mt-1" />
                      </div>
                    </div>
                    
                    <Button size="sm" className="w-full" onClick={() => {
                      if (trailClass && trail.modules.length > 0) {
                        const firstModule = trail.modules[0];
                        if (firstModule.content.length > 0) {
                          const firstContent = firstModule.content[0];
                          window.location.href = `/aluno/content/${firstContent.id}`;
                        }
                      }
                    }}>
                      <Play className="w-4 h-4 mr-2" />
                      Continuar
                    </Button>
                  </div>
                );
              })}
            </div>
            
            {allStudentTrails.length > 4 && (
              <div className="text-center mt-4">
                <Button variant="outline" asChild>
                  <Link to="/aluno/trilhas">Ver Todas as Trilhas</Link>
                </Button>
              </div>
            )}
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