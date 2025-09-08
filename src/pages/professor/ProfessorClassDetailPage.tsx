import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, BarChart3, TrendingUp, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useClasses } from '@/hooks/useClasses';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useUsers } from '@/hooks/useUsers';

export const ProfessorClassDetailPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useSupabaseAuth();
  const { classes, loading: classesLoading } = useClasses();
  const { enrollments, loading: enrollmentsLoading } = useEnrollments();
  const { users, loading: usersLoading } = useUsers();

  const classroom = classes.find(c => c.id === classId);
  const isLoading = classesLoading || enrollmentsLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Carregando...</h2>
          <p className="text-muted-foreground">Carregando dados da turma...</p>
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Turma não encontrada</h2>
          <p className="text-muted-foreground">A turma que você está procurando não existe.</p>
          <Button onClick={() => navigate('/professor/turmas')} className="mt-4">
            Voltar para Minhas Turmas
          </Button>
        </div>
      </div>
    );
  }

  // Check if user has access to this class (professor or admin)
  const hasAccess = userProfile?.roles.includes('admin') || 
    classroom.professors.some(p => p.id === userProfile?.id);

  if (!hasAccess) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Acesso negado</h2>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta turma.</p>
          <Button onClick={() => navigate('/professor/turmas')} className="mt-4">
            Voltar para Minhas Turmas
          </Button>
        </div>
      </div>
    );
  }

  // Get related data
  const classEnrollments = enrollments.filter(e => e.class_id === classId);
  const studentIds = classEnrollments.map(e => e.student_id);
  const students = users.filter(u => studentIds.includes(u.id));
  
  // Get professors from classroom data
  const professors = classroom.professors || [];
  
  // Get trails from classroom data  
  const classTrails = classroom.trails || [];

  // Calculate class progress statistics
  const getClassProgress = () => {
    if (classEnrollments.length === 0) return { avgProgress: 0, completedStudents: 0 };
    
    const totalProgress = classEnrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0);
    const avgProgress = totalProgress / classEnrollments.length;
    const completedStudents = classEnrollments.filter(e => e.progress >= 100).length;
    
    return { avgProgress, completedStudents };
  };

  const { avgProgress, completedStudents } = getClassProgress();

  // Get individual student progress
  const getStudentProgress = (studentId: string) => {
    const enrollment = classEnrollments.find(e => e.student_id === studentId);
    return enrollment ? enrollment.progress : 0;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/professor/turmas')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground">{classroom.name}</h1>
            <Badge variant={classroom.status === 'active' ? 'default' : 'secondary'}>
              {classroom.status === 'active' ? 'Ativa' : classroom.status === 'completed' ? 'Completa' : 'Pausada'}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Criada em {new Date(classroom.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress.toFixed(1)}%</div>
            <Progress value={avgProgress} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Concluídos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedStudents}</div>
            <p className="text-xs text-muted-foreground">
              {students.length > 0 ? ((completedStudents / students.length) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trilhas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classTrails.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="professors">Professores</TabsTrigger>
          <TabsTrigger value="trails">Trilhas</TabsTrigger>
          <TabsTrigger value="progress">Progresso Detalhado</TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Alunos ({students.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => {
                  const progress = getStudentProgress(student.id);
                  
                  return (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {student.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h4 className="font-medium">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{progress.toFixed(1)}%</div>
                        <Progress value={progress} className="w-24 mt-1" />
                      </div>
                    </div>
                  );
                })}
                {students.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum aluno matriculado nesta turma.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professors Tab */}
        <TabsContent value="professors">
          <Card>
            <CardHeader>
              <CardTitle>Professores Responsáveis ({professors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {professors.map((professor) => (
                  <div key={professor.id} className="flex items-center gap-3 p-4 border rounded-lg">
                    <div className="w-10 h-10 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {professor.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="font-medium">{professor.name}</h4>
                      <p className="text-sm text-muted-foreground">{professor.email}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        Professor
                      </Badge>
                    </div>
                  </div>
                ))}
                {professors.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum professor atribuído a esta turma.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trails Tab */}
        <TabsContent value="trails">
          <Card>
            <CardHeader>
              <CardTitle>Trilhas da Turma ({classTrails.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classTrails.map((trail) => (
                  <div key={trail.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{trail.title}</h4>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">Trilha</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {classTrails.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma trilha atribuída a esta turma.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Progress Tab */}
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Progresso Individual Detalhado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {students.map((student) => {
                  const enrollment = classEnrollments.find(e => e.student_id === student.id);
                  
                  return (
                    <div key={student.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                            {student.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <h4 className="font-medium">{student.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Matriculado em {enrollment ? new Date(enrollment.enrolled_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{enrollment?.progress.toFixed(1) || 0}%</div>
                        </div>
                      </div>
                      
                      <Progress value={enrollment?.progress || 0} className="mb-2" />
                      
                      {enrollment?.final_grade && (
                        <div className="mt-2">
                          <Badge variant="outline">
                            Nota Final: {enrollment.final_grade}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
                {students.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum aluno para mostrar progresso.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};