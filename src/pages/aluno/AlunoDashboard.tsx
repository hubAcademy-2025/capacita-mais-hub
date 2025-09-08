import { Play, Calendar, Trophy, BookOpen, CheckCircle } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useClasses } from '@/hooks/useClasses';
import { useTrails } from '@/hooks/useTrails';

export const AlunoDashboard = () => {
  const { userProfile } = useSupabaseAuth();
  const { enrollments, getClassEnrollments } = useEnrollments();
  const { classes } = useClasses();
  const { trails } = useTrails();
  
  if (!userProfile) return null;

  // Get student's enrollments and classes
  const studentEnrollments = enrollments.filter(e => e.student_id === userProfile.id);
  const studentClassIds = studentEnrollments.map(e => e.class_id);
  const studentClasses = classes.filter(c => studentClassIds.includes(c.id));
  
  // Get student's trails from their classes
  const studentTrails = studentClasses.flatMap(c => c.trails);
  
  // Get first enrollment for main stats (could be enhanced to show multiple)
  const mainEnrollment = studentEnrollments[0];
  const mainClass = mainEnrollment ? classes.find(c => c.id === mainEnrollment.class_id) : null;
  const mainTrail = mainClass?.trails[0];

  // Calculate stats
  const averageProgress = studentEnrollments.length > 0 
    ? Math.round(studentEnrollments.reduce((acc, e) => acc + e.progress, 0) / studentEnrollments.length)
    : 0;
    
  const totalModules = studentTrails.length; // Simplified - could be enhanced with actual module count
  const completedModules = Math.floor(averageProgress / 100 * totalModules);

  // Placeholder for upcoming meetings (to be implemented with meetings data)
  const upcomingMeetings: any[] = [];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-primary text-primary-foreground rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Olá, {userProfile?.name || userProfile?.email}! 👋
            </h2>
            <p className="text-primary-foreground/80 mb-4">
              Continue seu aprendizado onde parou
            </p>
            {mainTrail && (
              <Button asChild variant="secondary">
                <Link to="/aluno/trilhas">
                  <Play className="w-4 h-4 mr-2" />
                  Continuar Aprendendo
                </Link>
              </Button>
            )}
          </div>
          
          {mainEnrollment && (
            <div className="text-right">
              <p className="text-3xl font-bold">{averageProgress}%</p>
              <p className="text-primary-foreground/80">Progresso Geral</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Progresso da Trilha"
          value={`${averageProgress}%`}
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
          value={mainEnrollment?.final_grade || 'N/A'}
          icon={Trophy}
        />
      </div>

      {/* All Available Trails */}
      {studentTrails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suas Trilhas de Aprendizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentTrails.slice(0, 4).map((trail) => {
                const trailClass = studentClasses.find(c => 
                  c.trails.some(t => t.id === trail.id)
                );
                const trailEnrollment = trailClass ? studentEnrollments.find(e => e.class_id === trailClass.id) : null;
                
                return (
                  <div key={trail.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium">{trail.title}</h3>
                        <p className="text-sm text-muted-foreground">Trilha de aprendizado</p>
                        <Badge variant="outline" className="mt-1 text-xs">Trilha</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{trailEnrollment?.progress || 0}%</p>
                        <Progress value={trailEnrollment?.progress || 0} className="w-16 mt-1" />
                      </div>
                    </div>
                    
                    <Button size="sm" className="w-full" asChild>
                      <Link to="/aluno/trilhas">
                        <Play className="w-4 h-4 mr-2" />
                        Continuar
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
            
            {studentTrails.length > 4 && (
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