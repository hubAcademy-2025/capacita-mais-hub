import { Building, Users, BookOpen, BarChart3, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/ui/stats-card';
import { useAppStore } from '@/store/useAppStore';

export const AdminTurmasPage = () => {
  const { classes, users, trails } = useAppStore();

  const getClassStats = () => {
    const activeClasses = classes.filter(c => c.status === 'active').length;
    const totalStudents = classes.reduce((acc, c) => acc + c.studentIds.length, 0);
    const totalProfessors = new Set(classes.map(c => c.professorId)).size;
    
    return { activeClasses, totalStudents, totalProfessors };
  };

  const { activeClasses, totalStudents, totalProfessors } = getClassStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Turmas</h1>
          <p className="text-muted-foreground">Gerencie todas as turmas da plataforma</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Turma
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Turmas Ativas"
          value={activeClasses}
          icon={Building}
        />
        <StatsCard
          title="Total de Alunos"
          value={totalStudents}
          icon={Users}
        />
        <StatsCard
          title="Professores"
          value={totalProfessors}
          icon={Users}
        />
        <StatsCard
          title="Trilhas Ativas"
          value={trails.length}
          icon={BookOpen}
        />
      </div>

      {/* Classes List */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Turmas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {classes.map((classroom) => {
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
                      <p className="text-xs text-muted-foreground">
                        Criada em: {new Date(classroom.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{classroom.studentIds.length} alunos</p>
                      <Badge variant={classroom.status === 'active' ? 'default' : 'secondary'}>
                        {classroom.status === 'active' ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      Gerenciar
                    </Button>
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