import { useNavigate } from 'react-router-dom';
import { Calendar, Users, BookOpen, Clock, BarChart3 } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useClasses } from '@/hooks/useClasses';
import { useEnrollments } from '@/hooks/useEnrollments';

export const ProfessorDashboard = () => {
  const navigate = useNavigate();
  const { userProfile } = useSupabaseAuth();
  const { classes } = useClasses();
  const { enrollments } = useEnrollments();
  
  if (!userProfile) return null;

  // Get professor's classes - classes where the professor is assigned
  const myClasses = classes.filter(c => 
    c.professors.some(p => p.id === userProfile.id)
  );
  
  // Calculate total students across all professor's classes
  const totalStudents = myClasses.reduce((acc, c) => acc + c.student_count, 0);
  
  // Placeholder for upcoming meetings (to be implemented with meetings data)
  const upcomingMeetings: any[] = [];

  const calculateAvgProgress = (classId: string) => {
    const classEnrollments = enrollments.filter(e => e.class_id === classId);
    if (classEnrollments.length === 0) return 0;
    return Math.round(classEnrollments.reduce((acc, e) => acc + e.progress, 0) / classEnrollments.length);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
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
          icon={BarChart3}
        />
      </div>

      {/* My Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas Turmas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClasses.map((classItem) => {
              const trail = classItem.trails[0]; // Get first trail
              const avgProgress = calculateAvgProgress(classItem.id);
              
              return (
                <Card key={classItem.id} className="hover:shadow-elevated transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-foreground">{classItem.name}</h3>
                        <Badge variant={classItem.status === 'active' ? 'default' : 'secondary'}>
                          {classItem.status === 'active' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{trail?.title}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {classItem.student_count} alunos
                        </span>
                        <span className="font-medium text-primary">
                          {avgProgress}% progresso médio
                        </span>
                      </div>
                      
                      <Button 
                        onClick={() => navigate(`/professor/turmas/${classItem.id}`)}
                        size="sm" 
                        className="w-full"
                      >
                        Gerenciar Turma
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {myClasses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4" />
              <h3 className="font-medium mb-2">Nenhuma turma atribuída</h3>
              <p className="text-sm">Aguarde a atribuição de turmas pelo administrador.</p>
            </div>
          )}
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
              upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Reunião agendada</p>
                      <p className="text-sm text-muted-foreground">Em breve</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhum encontro agendado</h3>
                <p className="text-sm">Agende encontros para suas turmas.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};