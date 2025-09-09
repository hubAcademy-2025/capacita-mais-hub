import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, GraduationCap, TrendingUp, Plus, BarChart } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { CreateMeetingDialog } from '@/components/admin/CreateMeetingDialog';

export const AdminDashboard = () => {
  const { users, classes, trails } = useAppStore();
  
  const professors = users.filter(u => u.role === 'professor');
  const students = users.filter(u => u.role === 'aluno');
  const activeClasses = classes.filter(c => c.status === 'active');

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Gerencie turmas, usuários e encontros</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/relatorios">
              <BarChart className="w-4 h-4 mr-2" />
              Relatórios
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/meetings">
              <Users className="w-4 h-4 mr-2" />
              Encontros
            </Link>
          </Button>
          <CreateMeetingDialog>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agendar Encontro
            </Button>
          </CreateMeetingDialog>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Turmas"
          value={classes.length}
          icon={GraduationCap}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Professores Ativos"
          value={professors.length}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Alunos Inscritos"
          value={students.length}
          icon={BookOpen}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Trilhas Disponíveis"
          value={trails.length}
          icon={TrendingUp}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Turmas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeClasses.slice(0, 3).map((classItem) => {
                const professor = users.find(u => u.id === classItem.professorId);
                const trail = trails.find(t => t.id === classItem.trailId);
                
                return (
                  <div key={classItem.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{classItem.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Professor: {professor?.name} • {classItem.studentIds.length} alunos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-success">Ativa</p>
                      <p className="text-xs text-muted-foreground">{trail?.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nova turma criada</p>
                  <p className="text-xs text-muted-foreground">Turma React Avançado 2024</p>
                </div>
                <span className="text-xs text-muted-foreground">2h atrás</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Professor adicionado</p>
                  <p className="text-xs text-muted-foreground">Marina Santos</p>
                </div>
                <span className="text-xs text-muted-foreground">1 dia atrás</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Trilha atualizada</p>
                  <p className="text-xs text-muted-foreground">Desenvolvimento Web Moderno</p>
                </div>
                <span className="text-xs text-muted-foreground">2 dias atrás</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};