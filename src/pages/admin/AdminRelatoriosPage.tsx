import { BarChart3, TrendingUp, Users, Building, BookOpen, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/ui/stats-card';
import { useAppStore } from '@/store/useAppStore';

export const AdminRelatoriosPage = () => {
  const { classes, users, enrollments, trails, meetings, userProgress } = useAppStore();

  const getOverallStats = () => {
    const totalUsers = users.length;
    const activeClasses = classes.filter(c => c.status === 'active').length;
    const totalEnrollments = enrollments.length;
    const avgProgress = enrollments.length > 0 
      ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
      : 0;
    
    return { totalUsers, activeClasses, totalEnrollments, avgProgress };
  };

  const getEngagementData = () => {
    const completedContent = userProgress.filter(p => p.completed).length;
    const totalContent = trails.reduce((acc, t) => 
      acc + t.modules.reduce((modAcc, m) => modAcc + m.content.length, 0), 0
    );
    const engagementRate = totalContent > 0 ? (completedContent / totalContent) * 100 : 0;
    
    return { completedContent, totalContent, engagementRate };
  };

  const getTrailPerformance = () => {
    return trails.map(trail => {
      const trailClasses = classes.filter(c => c.trailId === trail.id);
      const trailEnrollments = enrollments.filter(e => 
        trailClasses.some(c => c.id === e.classId)
      );
      const avgProgress = trailEnrollments.length > 0
        ? Math.round(trailEnrollments.reduce((acc, e) => acc + e.progress, 0) / trailEnrollments.length)
        : 0;
      
      return {
        ...trail,
        studentsEnrolled: trailEnrollments.length,
        avgProgress,
        classesUsing: trailClasses.length
      };
    });
  };

  const { totalUsers, activeClasses, totalEnrollments, avgProgress } = getOverallStats();
  const { completedContent, totalContent, engagementRate } = getEngagementData();
  const trailPerformance = getTrailPerformance();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios e Analytics</h1>
        <p className="text-muted-foreground">Acompanhe o desempenho da plataforma</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Usuários"
          value={totalUsers}
          icon={Users}
        />
        <StatsCard
          title="Turmas Ativas"
          value={activeClasses}
          icon={Building}
        />
        <StatsCard
          title="Matrículas"
          value={totalEnrollments}
          icon={BookOpen}
        />
        <StatsCard
          title="Progresso Médio"
          value={`${avgProgress}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Engagement Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Engajamento Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Taxa de Engajamento</p>
              <p className="text-3xl font-bold text-primary">{Math.round(engagementRate)}%</p>
              <Progress value={engagementRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completedContent} de {totalContent} conteúdos concluídos
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Encontros Realizados</p>
              <p className="text-3xl font-bold text-success">
                {meetings.filter(m => m.status === 'completed').length}
              </p>
              <p className="text-xs text-muted-foreground">
                Total de encontros: {meetings.length}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Taxa de Conclusão</p>
              <p className="text-3xl font-bold text-warning">
                {enrollments.filter(e => e.progress === 100).length}
              </p>
              <p className="text-xs text-muted-foreground">
                Alunos que concluíram 100%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trail Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Trilha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trailPerformance.map((trail) => (
              <div key={trail.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{trail.title}</h3>
                    <p className="text-sm text-muted-foreground">{trail.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{trail.avgProgress}% progresso médio</p>
                    <p className="text-xs text-muted-foreground">
                      {trail.studentsEnrolled} alunos matriculados
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nível</p>
                    <p className="font-medium">{trail.level}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duração</p>
                    <p className="font-medium">{trail.duration}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Turmas usando</p>
                    <p className="font-medium">{trail.classesUsing}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Módulos</p>
                    <p className="font-medium">{trail.modules.length}</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progresso médio</span>
                    <span>{trail.avgProgress}%</span>
                  </div>
                  <Progress value={trail.avgProgress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Class Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Turma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {classes.map((classroom) => {
              const classEnrollments = enrollments.filter(e => e.classId === classroom.id);
              const avgProgress = classEnrollments.length > 0
                ? Math.round(classEnrollments.reduce((acc, e) => acc + e.progress, 0) / classEnrollments.length)
                : 0;
              const professor = users.find(u => u.id === classroom.professorId);
              const trail = trails.find(t => t.id === classroom.trailId);
              
              return (
                <div key={classroom.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{classroom.name}</h3>
                      <p className="text-sm text-muted-foreground">Professor: {professor?.name}</p>
                      <p className="text-sm text-muted-foreground">Trilha: {trail?.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">{classEnrollments.length}</p>
                      <p className="text-xs text-muted-foreground">alunos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{avgProgress}%</p>
                      <p className="text-xs text-muted-foreground">progresso</p>
                    </div>
                    <div className="w-24">
                      <Progress value={avgProgress} className="h-2" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};