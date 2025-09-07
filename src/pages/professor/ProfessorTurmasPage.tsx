import { Users, Building, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

export const ProfessorTurmasPage = () => {
  const navigate = useNavigate();
  const { currentUser, classes, users, trails, enrollments } = useAppStore();

  if (!currentUser) return null;

  const professorClasses = classes.filter(c => 
    (c.professorIds && c.professorIds.includes(currentUser.id)) || 
    // @ts-ignore - backward compatibility
    c.professorId === currentUser.id
  );

  const calculateAvgProgress = (classId: string) => {
    const classEnrollments = enrollments.filter(e => e.classId === classId);
    if (classEnrollments.length === 0) return 0;
    return Math.round(classEnrollments.reduce((acc, e) => acc + e.progress, 0) / classEnrollments.length);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Minhas Turmas</h1>
        <p className="text-muted-foreground">Gerencie suas turmas e acompanhe o progresso dos alunos</p>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professorClasses.map((classroom) => {
          const trail = trails.find(t => t.id === classroom.trailId);
          const avgProgress = calculateAvgProgress(classroom.id);
          const classEnrollments = enrollments.filter(e => e.classId === classroom.id);
          
          return (
            <Card key={classroom.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{classroom.name}</CardTitle>
                    <Badge variant={classroom.status === 'active' ? 'default' : 'secondary'} className="mt-2">
                      {classroom.status === 'active' ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  <Building className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {trail && (
                  <div>
                    <p className="text-sm font-medium mb-1">Trilha: {trail.title}</p>
                    <Badge variant="outline" className="text-xs">{trail.level}</Badge>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Alunos</p>
                    <p className="font-medium">{classroom.studentIds.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Progresso Médio</p>
                    <p className="font-medium">{avgProgress}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Engajamento</span>
                    <span>{avgProgress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${avgProgress}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={() => navigate(`/professor/turma/${classroom.id}`)}
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

      {professorClasses.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Nenhuma turma atribuída</h3>
            <p className="text-sm text-muted-foreground">
              Aguarde a atribuição de turmas pelo administrador.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {professorClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{professorClasses.length}</p>
                <p className="text-sm text-muted-foreground">Turmas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">
                  {professorClasses.reduce((acc, c) => acc + c.studentIds.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total de Alunos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">
                  {Math.round(professorClasses.reduce((acc, c) => acc + calculateAvgProgress(c.id), 0) / professorClasses.length) || 0}%
                </p>
                <p className="text-sm text-muted-foreground">Progresso Médio</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">
                  {professorClasses.filter(c => c.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Turmas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};