import { BarChart3, TrendingUp, Users, Clock, Target, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';

export const ProfessorAnalyticsPage = () => {
  const { currentUser, classes, enrollments, trails, userProgress, meetings } = useAppStore();

  if (!currentUser) return null;

  const professorClasses = classes.filter(c => 
    (c.professorIds && c.professorIds.includes(currentUser.id)) || 
    // @ts-ignore - backward compatibility
    c.professorId === currentUser.id
  );
  
  const getAnalyticsData = () => {
    const totalStudents = professorClasses.reduce((acc, c) => acc + c.studentIds.length, 0);
    const allEnrollments = enrollments.filter(e => 
      professorClasses.some(c => c.id === e.classId)
    );
    
    const avgProgress = allEnrollments.length > 0
      ? Math.round(allEnrollments.reduce((acc, e) => acc + e.progress, 0) / allEnrollments.length)
      : 0;
    
    const completedStudents = allEnrollments.filter(e => e.progress === 100).length;
    const completionRate = totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0;
    
    return { totalStudents, avgProgress, completedStudents, completionRate };
  };

  const getClassAnalytics = () => {
    return professorClasses.map(classroom => {
      const classEnrollments = enrollments.filter(e => e.classId === classroom.id);
      const avgProgress = classEnrollments.length > 0
        ? Math.round(classEnrollments.reduce((acc, e) => acc + e.progress, 0) / classEnrollments.length)
        : 0;
      
        const trail = trails.find(t => 
          classroom.trailIds?.includes(t.id) || 
          // @ts-ignore - backward compatibility
          classroom.trailId === t.id
        );
      const classMeetings = meetings.filter(m => m.classId === classroom.id);
      
      // Calculate content engagement
      const allContent = trail ? trail.modules.flatMap(m => m.content) : [];
      const studentProgress = userProgress.filter(p => 
        classroom.studentIds.includes(p.userId) && 
        allContent.some(c => c.id === p.contentId)
      );
      const engagementRate = allContent.length > 0 && studentProgress.length > 0
        ? (studentProgress.filter(p => p.completed).length / (allContent.length * classroom.studentIds.length)) * 100
        : 0;
      
      return {
        ...classroom,
        trail,
        avgProgress,
        enrollmentCount: classEnrollments.length,
        meetingsCount: classMeetings.length,
        engagementRate: Math.round(engagementRate)
      };
    });
  };

  const { totalStudents, avgProgress, completedStudents, completionRate } = getAnalyticsData();
  const classAnalytics = getClassAnalytics();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Acompanhe o desempenho das suas turmas</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-primary-light to-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Total de Alunos</p>
                <p className="text-3xl font-bold text-primary">{totalStudents}</p>
                <p className="text-xs text-primary/70">em {professorClasses.length} turmas</p>
              </div>
              <Users className="w-12 h-12 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-success-light to-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success">Progresso Médio</p>
                <p className="text-3xl font-bold text-success">{avgProgress}%</p>
                <p className="text-xs text-success/70">todas as turmas</p>
              </div>
              <TrendingUp className="w-12 h-12 text-success/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-warning-light to-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warning">Taxa de Conclusão</p>
                <p className="text-3xl font-bold text-warning">{Math.round(completionRate)}%</p>
                <p className="text-xs text-warning/70">{completedStudents} concluíram</p>
              </div>
              <Target className="w-12 h-12 text-warning/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-accent-light to-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent">Encontros</p>
                <p className="text-3xl font-bold text-accent">
                  {meetings.filter(m => professorClasses.some(c => c.id === m.classId)).length}
                </p>
                <p className="text-xs text-accent/70">total realizados</p>
              </div>
              <Award className="w-12 h-12 text-accent/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Turma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {classAnalytics.map((classData) => (
              <div key={classData.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-lg">{classData.name}</h3>
                    <p className="text-sm text-muted-foreground">{classData.trail?.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{classData.trail?.level}</Badge>
                      <Badge variant={classData.status === 'active' ? 'default' : 'secondary'}>
                        {classData.status === 'active' ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{classData.avgProgress}%</p>
                    <p className="text-sm text-muted-foreground">progresso médio</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold">{classData.studentIds.length}</p>
                    <p className="text-xs text-muted-foreground">Alunos</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold">{classData.enrollmentCount}</p>
                    <p className="text-xs text-muted-foreground">Matrículas</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold">{classData.meetingsCount}</p>
                    <p className="text-xs text-muted-foreground">Encontros</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold">{classData.engagementRate}%</p>
                    <p className="text-xs text-muted-foreground">Engajamento</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso da Turma</span>
                    <span>{classData.avgProgress}%</span>
                  </div>
                  <Progress value={classData.avgProgress} className="h-2" />
                </div>

                <div className="mt-3 pt-3 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Módulos</p>
                      <p className="font-medium">{classData.trail?.modules.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duração</p>
                      <p className="font-medium">{classData.trail?.duration || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Criada em</p>
                      <p className="font-medium">{new Date(classData.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{classData.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {classAnalytics.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhuma turma para analisar</h3>
                <p className="text-sm">Aguarde a atribuição de turmas pelo administrador.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Timeline */}
      {professorClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Engajamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-lg font-bold">{avgProgress}%</p>
                  <p className="text-sm text-muted-foreground">Progresso Geral</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Users className="w-8 h-8 mx-auto mb-2 text-success" />
                  <p className="text-lg font-bold">{totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Alunos Ativos</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Award className="w-8 h-8 mx-auto mb-2 text-warning" />
                  <p className="text-lg font-bold">{Math.round(completionRate)}%</p>
                  <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};