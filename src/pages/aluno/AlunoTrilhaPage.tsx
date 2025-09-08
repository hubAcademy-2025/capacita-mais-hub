import { BookOpen, Play, Target, CheckCircle, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useClasses } from '@/hooks/useClasses';
import { useTrails } from '@/hooks/useTrails';

export const AlunoTrilhaPage = () => {
  const { userProfile } = useSupabaseAuth();
  const { enrollments } = useEnrollments();
  const { classes } = useClasses();
  const { trails } = useTrails();

  if (!userProfile) return null;

  // Get student's enrollments and classes
  const studentEnrollments = enrollments.filter(e => e.student_id === userProfile.id);
  const studentClassIds = studentEnrollments.map(e => e.class_id);
  const studentClasses = classes.filter(c => studentClassIds.includes(c.id));
  
  // Get student's trails from their classes
  const studentTrails = studentClasses.flatMap(c => c.trails);

  const calculateOverallProgress = () => {
    if (studentEnrollments.length === 0) return 0;
    const totalProgress = studentEnrollments.reduce((acc, e) => acc + e.progress, 0);
    return Math.round(totalProgress / studentEnrollments.length);
  };

  const getContentProgress = () => {
    // Simplified for now - can be enhanced with actual content progress tracking
    const completed = Math.floor(calculateOverallProgress() / 10); // Mock calculation
    const total = 10; // Mock total
    
    return {
      total,
      completed,
      percentage: total > 0 ? (completed / total) * 100 : 0
    };
  };

  const overallProgress = calculateOverallProgress();
  const contentProgress = getContentProgress();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Minhas Trilhas</h1>
        <p className="text-muted-foreground">Continue sua jornada de aprendizado</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-primary-light to-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Progresso Geral</p>
                <p className="text-3xl font-bold text-primary">{overallProgress}%</p>
                <p className="text-xs text-primary/70">das suas turmas</p>
              </div>
              <Target className="w-12 h-12 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-success-light to-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success">Conteúdos</p>
                <p className="text-3xl font-bold text-success">{contentProgress.completed}</p>
                <p className="text-xs text-success/70">de {contentProgress.total} concluídos</p>
              </div>
              <CheckCircle className="w-12 h-12 text-success/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-warning-light to-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warning">Pontos</p>
                <p className="text-3xl font-bold text-warning">0</p>
                <p className="text-xs text-warning/70">total acumulado</p>
              </div>
              <Award className="w-12 h-12 text-warning/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Section - Hidden for now since we don't have badge data */}
      {false && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Suas Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Badges em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Trail Focus */}
      {studentClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Continue de onde parou</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studentClasses.slice(0, 2).map((classroom) => {
                const enrollment = studentEnrollments.find(e => e.class_id === classroom.id);
                const trail = classroom.trails[0]; // Get first trail
                
                return (
                  <div key={classroom.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{classroom.name}</h3>
                        <p className="text-sm text-muted-foreground">{trail?.title}</p>
                        <Badge variant="outline" className="mt-1 text-xs">Trilha</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{enrollment?.progress || 0}%</p>
                        <Progress value={enrollment?.progress || 0} className="w-16 mt-1" />
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
          </CardContent>
        </Card>
      )}

      {/* All Trails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Suas Trilhas de Aprendizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentTrails.map((trail) => (
              <div key={trail.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-medium mb-2">{trail.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">Trilha de aprendizado</p>
                <Button size="sm" className="w-full" asChild>
                  <Link to="/aluno/trilhas">
                    <Play className="w-4 h-4 mr-2" />
                    Acessar
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* No Trails State */}
      {studentTrails.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Nenhuma trilha disponível</h3>
            <p className="text-sm text-muted-foreground">
              Você ainda não está matriculado em nenhuma turma com trilhas de aprendizado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};