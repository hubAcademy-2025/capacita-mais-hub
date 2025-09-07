import { Calendar, Users, BookOpen, Clock } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { Link } from 'react-router-dom';

export const ProfessorDashboard = () => {
  const { 
    currentUser, 
    getClassesByProfessor, 
    users, 
    trails, 
    enrollments, 
    getClassMeetings 
  } = useAppStore();
  
  const myClasses = currentUser ? getClassesByProfessor(currentUser.id) : [];
  const totalStudents = myClasses.reduce((acc, c) => acc + c.studentIds.length, 0);
  
  const upcomingMeetings = myClasses.flatMap(c => 
    getClassMeetings(c.id).filter(m => 
      new Date(m.dateTime) > new Date() && m.status === 'scheduled'
    )
  ).slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Minhas Turmas"
          value={myClasses.length}
          icon={BookOpen}
        />
        <StatsCard
          title="Total de Alunos"
          value={totalStudents}
          icon={Users}
        />
        <StatsCard
          title="Próximos Encontros"
          value={upcomingMeetings.length}
          icon={Calendar}
        />
        <StatsCard
          title="Taxa de Conclusão"
          value="78%"
          icon={Clock}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* My Classes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Minhas Turmas</CardTitle>
          <Button asChild>
            <Link to="/professor/turmas">Ver Todas</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClasses.map((classItem) => {
              const trail = trails.find(t => t.id === classItem.trailId);
              const classEnrollments = enrollments.filter(e => e.classId === classItem.id);
              const avgProgress = classEnrollments.length > 0 
                ? Math.round(classEnrollments.reduce((acc, e) => acc + e.progress, 0) / classEnrollments.length)
                : 0;
              
              return (
                <Card key={classItem.id} className="hover:shadow-elevated transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-foreground">{classItem.name}</h3>
                        <Badge variant="secondary">{classItem.status}</Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{trail?.title}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {classItem.studentIds.length} alunos
                        </span>
                        <span className="font-medium text-primary">
                          {avgProgress}% progresso médio
                        </span>
                      </div>
                      
                      <Button asChild size="sm" className="w-full">
                        <Link to={`/professor/turmas/${classItem.id}`}>
                          Gerenciar Turma
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Meetings */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Encontros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => {
                const classItem = myClasses.find(c => c.id === meeting.classId);
                
                return (
                  <div key={meeting.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{meeting.title}</p>
                        <p className="text-sm text-muted-foreground">{classItem?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(meeting.dateTime).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(meeting.dateTime).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                  </div>
                );
              })
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