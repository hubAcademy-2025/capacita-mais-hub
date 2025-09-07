import { User, Award, BookOpen, Calendar, BarChart3, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/ui/stats-card';
import { useAppStore } from '@/store/useAppStore';

export const PerfilPage = () => {
  const { currentUser, currentRole, userPoints, badges, enrollments, classes, userProgress } = useAppStore();

  if (!currentUser) return null;

  const userPointsData = userPoints.find(up => up.userId === currentUser.id);
  const earnedBadges = badges.filter(b => userPointsData?.badges.includes(b.id));
  
  const getUserStats = () => {
    if (currentRole === 'aluno') {
      const studentEnrollments = enrollments.filter(e => e.studentId === currentUser.id);
      const studentClasses = classes.filter(c => studentEnrollments.some(e => e.classId === c.id));
      const completedContent = userProgress.filter(p => p.userId === currentUser.id && p.completed).length;
      
      return {
        totalClasses: studentClasses.length,
        totalPoints: userPointsData?.totalPoints || 0,
        completedContent,
        badges: earnedBadges.length
      };
    } else if (currentRole === 'professor') {
      const professorClasses = classes.filter(c => c.professorId === currentUser.id);
      const totalStudents = professorClasses.reduce((acc, c) => acc + c.studentIds.length, 0);
      
      return {
        totalClasses: professorClasses.length,
        totalStudents,
        activeClasses: professorClasses.filter(c => c.status === 'active').length,
        badges: earnedBadges.length
      };
    } else {
      return {
        totalClasses: classes.length,
        totalUsers: classes.reduce((acc, c) => acc + c.studentIds.length, 0),
        activeClasses: classes.filter(c => c.status === 'active').length,
        badges: earnedBadges.length
      };
    }
  };

  const stats = getUserStats();

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return { name: 'Administrador', color: 'bg-destructive text-destructive-foreground' };
      case 'professor':
        return { name: 'Professor', color: 'bg-primary text-primary-foreground' };
      case 'aluno':
        return { name: 'Aluno', color: 'bg-secondary text-secondary-foreground' };
      default:
        return { name: role, color: 'bg-muted text-muted-foreground' };
    }
  };

  const roleDisplay = getRoleDisplay(currentRole);

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">Informações da sua conta e atividades</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {currentUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                <Badge className={roleDisplay.color}>
                  {roleDisplay.name}
                </Badge>
              </div>
              
              <p className="text-muted-foreground mb-4">{currentUser.email}</p>
              
              <div className="flex gap-2">
                <Button size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentRole === 'aluno' && (
          <>
            <StatsCard
              title="Turmas Matriculadas"
              value={stats.totalClasses}
              icon={BookOpen}
            />
            <StatsCard
              title="Pontos Totais"
              value={stats.totalPoints}
              icon={BarChart3}
            />
            <StatsCard
              title="Conteúdos Concluídos"
              value={stats.completedContent}
              icon={Award}
            />
            <StatsCard
              title="Conquistas"
              value={stats.badges}
              icon={Award}
            />
          </>
        )}
        
        {currentRole === 'professor' && (
          <>
            <StatsCard
              title="Turmas Lecionadas"
              value={stats.totalClasses}
              icon={BookOpen}
            />
            <StatsCard
              title="Total de Alunos"
              value={(stats as any).totalStudents}
              icon={User}
            />
            <StatsCard
              title="Turmas Ativas"
              value={(stats as any).activeClasses}
              icon={Calendar}
            />
            <StatsCard
              title="Conquistas"
              value={stats.badges}
              icon={Award}
            />
          </>
        )}
        
        {currentRole === 'admin' && (
          <>
            <StatsCard
              title="Total de Turmas"
              value={stats.totalClasses}
              icon={BookOpen}
            />
            <StatsCard
              title="Total de Usuários"
              value={(stats as any).totalUsers}
              icon={User}
            />
            <StatsCard
              title="Turmas Ativas"
              value={(stats as any).activeClasses}
              icon={Calendar}
            />
            <StatsCard
              title="Conquistas"
              value={stats.badges}
              icon={Award}
            />
          </>
        )}
      </div>

      {/* Badges Section */}
      {earnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Conquistas e Medalhas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {earnedBadges.map((badge) => (
                <div key={badge.id} className="text-center p-4 border rounded-lg bg-gradient-to-b from-accent-light to-accent/10">
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <h3 className="font-medium text-sm">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    +{badge.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Summary for Students */}
      {currentRole === 'aluno' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Resumo de Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrollments.filter(e => e.studentId === currentUser.id).map((enrollment, index) => {
                const classroom = classes.find(c => c.id === enrollment.classId);
                return (
                  <div key={`${enrollment.classId}-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{classroom?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Nota: {enrollment.finalGrade || 'Pendente'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{enrollment.progress}%</p>
                      <Progress value={enrollment.progress} className="w-24 mt-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};