import { BookOpen, Play, Lock, CheckCircle, Award, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { TrilhaTab } from '@/components/aluno/TrilhaTab';

export const AlunoTrilhaPage = () => {
  const { currentUser, classes, enrollments, trails, userProgress, userPoints, badges } = useAppStore();

  if (!currentUser) return null;

  const studentEnrollments = enrollments.filter(e => e.studentId === currentUser.id);
  const studentClasses = classes.filter(c => studentEnrollments.some(e => e.classId === c.id));
  const studentTrails = trails.filter(t => 
    studentClasses.some(c => 
      (c.trailIds && c.trailIds.includes(t.id)) || 
      // @ts-ignore - backward compatibility
      c.trailId === t.id
    )
  );

  const userPointsData = userPoints.find(up => up.userId === currentUser.id);
  const earnedBadges = badges.filter(b => userPointsData?.badges.includes(b.id));

  const calculateOverallProgress = () => {
    if (studentEnrollments.length === 0) return 0;
    const totalProgress = studentEnrollments.reduce((acc, e) => acc + e.progress, 0);
    return Math.round(totalProgress / studentEnrollments.length);
  };

  const getContentProgress = () => {
    const allContent = studentTrails.flatMap(t => t.modules.flatMap(m => m.content));
    const userContentProgress = userProgress.filter(p => p.userId === currentUser.id);
    const completedContent = userContentProgress.filter(p => p.completed).length;
    
    return {
      total: allContent.length,
      completed: completedContent,
      percentage: allContent.length > 0 ? (completedContent / allContent.length) * 100 : 0
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
                <p className="text-3xl font-bold text-warning">{userPointsData?.totalPoints || 0}</p>
                <p className="text-xs text-warning/70">total acumulado</p>
              </div>
              <Award className="w-12 h-12 text-warning/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Section */}
      {earnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Suas Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {earnedBadges.map((badge) => (
                <div key={badge.id} className="flex-shrink-0 text-center p-4 border rounded-lg bg-gradient-to-b from-accent-light to-accent/10 min-w-[120px]">
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <h3 className="font-medium text-sm">{badge.name}</h3>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    +{badge.points} pts
                  </Badge>
                </div>
              ))}
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
                const enrollment = studentEnrollments.find(e => e.classId === classroom.id);
                const trail = trails.find(t => 
                  (classroom.trailIds && classroom.trailIds.includes(t.id)) || 
                  // @ts-ignore - backward compatibility
                  classroom.trailId === t.id
                );
                
                return (
                  <div key={classroom.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{classroom.name}</h3>
                        <p className="text-sm text-muted-foreground">{trail?.title}</p>
                        <Badge variant="outline" className="mt-1 text-xs">{trail?.level}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{enrollment?.progress || 0}%</p>
                        <Progress value={enrollment?.progress || 0} className="w-16 mt-1" />
                      </div>
                    </div>
                    
                    <Button size="sm" className="w-full" onClick={() => {
                      // Navigate to the first content in the trail
                      if (trail && trail.modules.length > 0) {
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
          <TrilhaTab trails={studentTrails} />
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