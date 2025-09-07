import { Trophy, Target, TrendingUp, Award, Star, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';

export const AlunoProgressoPage = () => {
  const { currentUser, classes, enrollments, trails, userProgress, badges, userPoints } = useAppStore();

  if (!currentUser) return null;

  const studentEnrollments = enrollments.filter(e => e.studentId === currentUser.id);
  const studentClasses = classes.filter(c => studentEnrollments.some(e => e.classId === c.id));
  const userPointsData = userPoints.find(up => up.userId === currentUser.id);
  const earnedBadges = badges.filter(b => userPointsData?.badges.includes(b.id));

  const calculateOverallProgress = () => {
    if (studentEnrollments.length === 0) return 0;
    const totalProgress = studentEnrollments.reduce((acc, e) => acc + e.progress, 0);
    return Math.round(totalProgress / studentEnrollments.length);
  };

  const getContentProgress = () => {
    const allTrails = trails.filter(t => 
      studentClasses.some(c => c.trailId === t.id)
    );
    
    const allContent = allTrails.flatMap(t => t.modules.flatMap(m => m.content));
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
        <h1 className="text-3xl font-bold text-foreground">Meu Progresso</h1>
        <p className="text-muted-foreground">Acompanhe sua evolução e conquistas</p>
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
              <TrendingUp className="w-12 h-12 text-success/50" />
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
              <Star className="w-12 h-12 text-warning/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress by Class */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso por Turma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {studentClasses.map((classroom) => {
              const enrollment = studentEnrollments.find(e => e.classId === classroom.id);
              const trail = trails.find(t => t.id === classroom.trailId);
              
              return (
                <div key={classroom.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{classroom.name}</h3>
                      <p className="text-sm text-muted-foreground">{trail?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{enrollment?.progress || 0}%</p>
                      {enrollment?.finalGrade && (
                        <p className="text-xs text-muted-foreground">Nota: {enrollment.finalGrade}</p>
                      )}
                    </div>
                  </div>
                  <Progress value={enrollment?.progress || 0} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Badges & Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Conquistas e Medalhas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {earnedBadges.map((badge) => (
              <div key={badge.id} className="text-center p-4 border rounded-lg bg-gradient-to-b from-accent-light to-accent/10">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className="font-medium text-sm">{badge.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                <Badge variant="secondary" className="mt-2 text-xs">
                  +{badge.points} pts
                </Badge>
              </div>
            ))}
            
            {/* Available Badges */}
            {badges.filter(b => !userPointsData?.badges.includes(b.id)).slice(0, 2).map((badge) => (
              <div key={badge.id} className="text-center p-4 border-2 border-dashed border-muted rounded-lg opacity-50">
                <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                <h3 className="font-medium text-sm text-muted-foreground">{badge.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                <Badge variant="outline" className="mt-2 text-xs">
                  {badge.points} pts
                </Badge>
              </div>
            ))}
          </div>
          
          {earnedBadges.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="w-12 h-12 mx-auto mb-4" />
              <h3 className="font-medium mb-2">Nenhuma medalha ainda</h3>
              <p className="text-sm">Continue estudando para conquistar suas primeiras medalhas!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userProgress
              .filter(p => p.userId === currentUser.id)
              .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
              .slice(0, 5)
              .map((progress, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    progress.completed ? 'bg-success' : 'bg-warning'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {progress.completed ? 'Concluído' : 'Em progresso'}: Conteúdo #{progress.contentId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(progress.lastAccessed).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(progress.lastAccessed).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  {progress.completed && (
                    <Badge variant="secondary" className="text-xs">
                      +10 pts
                    </Badge>
                  )}
                </div>
              ))}
            
            {userProgress.filter(p => p.userId === currentUser.id).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhuma atividade recente</h3>
                <p className="text-sm">Comece a estudar para ver sua atividade aqui!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};