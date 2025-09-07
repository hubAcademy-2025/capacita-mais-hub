import { Building, Users, BookOpen, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/ui/stats-card';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { CreateClassDialog } from '@/components/admin/CreateClassDialog';
import { ManageClassDialog } from '@/components/admin/ManageClassDialog';

export const AdminTurmasPage = () => {
  const { classes, users, trails } = useAppStore();
  const navigate = useNavigate();

  const getClassStats = () => {
    const activeClasses = classes.filter(c => c.status === 'active').length;
    const totalStudents = classes.reduce((acc, c) => acc + c.studentIds.length, 0);
    // Update to handle multiple professors per class
    const allProfessorIds = classes.flatMap(c => c.professorIds || 
      // @ts-ignore - backward compatibility
      [c.professorId]).filter(Boolean);
    const totalProfessors = new Set(allProfessorIds).size;
    
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
        <CreateClassDialog />
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
              // Handle both old and new data structure
              const professorIds = classroom.professorIds || 
                // @ts-ignore - backward compatibility
                [classroom.professorId].filter(Boolean);
              const trailIds = classroom.trailIds || 
                // @ts-ignore - backward compatibility
                [classroom.trailId].filter(Boolean);
              
              const professors = users.filter(u => professorIds.includes(u.id));
              const classTrails = trails.filter(t => trailIds.includes(t.id));
              
              return (
                <div key={classroom.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{classroom.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Professores: {professors.length > 0 ? professors.map(p => p.name).join(', ') : 'Nenhum professor'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Trilhas: {classTrails.length > 0 ? `${classTrails.length} trilha(s)` : 'Nenhuma trilha'}
                      </p>
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/turmas/${classroom.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                      <ManageClassDialog classroom={classroom} />
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