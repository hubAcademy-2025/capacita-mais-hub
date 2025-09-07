import { BookOpen, Plus, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/ui/stats-card';
import { useAppStore } from '@/store/useAppStore';

export const AdminTrilhasPage = () => {
  const { trails, classes } = useAppStore();

  const getTrailStats = () => {
    const totalModules = trails.reduce((acc, t) => acc + t.modules.length, 0);
    const totalContent = trails.reduce((acc, t) => 
      acc + t.modules.reduce((modAcc, m) => modAcc + m.content.length, 0), 0
    );
    const activeTrails = trails.filter(t => !t.isBlocked).length;
    
    return { totalModules, totalContent, activeTrails };
  };

  const { totalModules, totalContent, activeTrails } = getTrailStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Trilhas</h1>
          <p className="text-muted-foreground">Crie e gerencie trilhas de aprendizado</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Trilha
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Trilhas Ativas"
          value={activeTrails}
          icon={BookOpen}
        />
        <StatsCard
          title="Total de Módulos"
          value={totalModules}
          icon={Users}
        />
        <StatsCard
          title="Conteúdos"
          value={totalContent}
          icon={Clock}
        />
        <StatsCard
          title="Em Uso"
          value={classes.length}
          icon={Users}
        />
      </div>

      {/* Trails List */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Trilhas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trails.map((trail) => {
              const usedInClasses = classes.filter(c => c.trailId === trail.id).length;
              const totalContent = trail.modules.reduce((acc, m) => acc + m.content.length, 0);
              
              return (
                <Card key={trail.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{trail.title}</CardTitle>
                        <Badge variant="outline" className="mt-2">
                          {trail.level}
                        </Badge>
                      </div>
                      <Badge variant={trail.isBlocked ? 'destructive' : 'default'}>
                        {trail.isBlocked ? 'Bloqueada' : 'Ativa'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{trail.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Módulos:</span>
                        <span className="font-medium">{trail.modules.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Conteúdos:</span>
                        <span className="font-medium">{totalContent}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Duração:</span>
                        <span className="font-medium">{trail.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Usado em:</span>
                        <span className="font-medium">{usedInClasses} turmas</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Certificado:</span>
                        <Badge variant={trail.certificateConfig.enabled ? 'default' : 'secondary'} className="text-xs">
                          {trail.certificateConfig.enabled ? 'Habilitado' : 'Desabilitado'}
                        </Badge>
                      </div>
                      {trail.certificateConfig.enabled && (
                        <div className="text-xs text-muted-foreground">
                          Tipo: {trail.certificateConfig.type}
                        </div>
                      )}
                    </div>

                    <Button variant="outline" size="sm" className="w-full">
                      Editar Trilha
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};