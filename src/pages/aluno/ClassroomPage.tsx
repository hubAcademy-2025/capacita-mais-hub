import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/useAppStore';
import { TrilhaTab } from '@/components/aluno/TrilhaTab';
import { CommunityTab } from '@/components/aluno/CommunityTab';
import { BookOpen, Users, Calendar, BarChart3 } from 'lucide-react';

export const ClassroomPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const { classes, trails, currentUser, enrollments } = useAppStore();
  
  const classroom = classes.find(c => c.id === classId);
  const enrollment = enrollments.find(e => e.classId === classId && e.studentId === currentUser?.id);
  
  if (!classroom || !enrollment) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Turma não encontrada</h2>
            <p className="text-muted-foreground">
              Você não tem acesso a esta turma ou ela não existe.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const classTrails = trails.filter(t => classroom.trailId === t.id || 
    (Array.isArray(classroom.trailId) && classroom.trailId.includes(t.id)));

  return (
    <div className="p-6 space-y-6">
      {/* Class Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{classroom.name}</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant={classroom.status === 'active' ? 'default' : 'secondary'}>
                  {classroom.status === 'active' ? 'Ativa' : 'Inativa'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {classroom.studentIds.length} alunos
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium mb-1">Seu Progresso</div>
              <div className="flex items-center gap-2">
                <Progress value={enrollment.progress} className="w-24" />
                <span className="text-sm text-muted-foreground">
                  {enrollment.progress}%
                </span>
              </div>
              {enrollment.finalGrade && (
                <div className="text-sm text-muted-foreground mt-1">
                  Nota: {enrollment.finalGrade}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="trilhas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trilhas" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Trilhas
          </TabsTrigger>
          <TabsTrigger value="comunidade" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Comunidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trilhas" className="mt-6">
          <TrilhaTab trails={classTrails} />
        </TabsContent>

        <TabsContent value="comunidade" className="mt-6">
          <CommunityTab classId={classroom.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};