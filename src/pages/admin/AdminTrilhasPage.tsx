import { useState } from 'react';
import { BookOpen, Plus, Users, Clock, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/ui/stats-card';
import { CreateTrailDialog } from '@/components/admin/CreateTrailDialog';
import { EditTrailDialog } from '@/components/admin/EditTrailDialog';
import { ManageTrailContentDialogNew } from '@/components/admin/ManageTrailContentDialogNew';
import { useTrails } from '@/hooks/useTrails';
import type { TrailWithDetails } from '@/hooks/useTrails';

export const AdminTrilhasPage = () => {
  const { trails, loading, getTrailStats } = useTrails();
  const [editingTrail, setEditingTrail] = useState<TrailWithDetails | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [manageContentTrail, setManageContentTrail] = useState<TrailWithDetails | null>(null);
  const [manageContentOpen, setManageContentOpen] = useState(false);

  const { totalModules, totalContent, activeTrails } = getTrailStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Trilhas</h1>
          <p className="text-muted-foreground">Crie e gerencie trilhas de aprendizado</p>
        </div>
        <CreateTrailDialog />
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
          title="Total de Trilhas"
          value={trails.length}
          icon={Users}
        />
      </div>

      {/* Trails List */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Trilhas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando trilhas...</div>
          ) : trails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma trilha criada ainda. Crie sua primeira trilha!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trails.map((trail) => (
                <Card key={trail.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{trail.title}</CardTitle>
                        <Badge variant="outline" className="mt-2">
                          {trail.level === 'Iniciante' ? 'Iniciante' : 
                           trail.level === 'Intermediário' ? 'Intermediário' : 
                           trail.level === 'Avançado' ? 'Avançado' : trail.level}
                        </Badge>
                      </div>
                      <Badge variant="default">Ativa</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{trail.description || 'Sem descrição'}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Módulos:</span>
                        <span className="font-medium">{trail.module_count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Conteúdos:</span>
                        <span className="font-medium">{trail.content_count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Duração:</span>
                        <span className="font-medium">{trail.duration || 'Não definida'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Usado em:</span>
                        <span className="font-medium">{trail.class_count} turmas</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Certificado:</span>
                        <Badge variant={trail.certificate_enabled ? 'default' : 'secondary'} className="text-xs">
                          {trail.certificate_enabled ? 'Habilitado' : 'Desabilitado'}
                        </Badge>
                      </div>
                      {trail.certificate_enabled && (
                        <div className="text-xs text-muted-foreground">
                          Tipo: {trail.certificate_type}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingTrail(trail);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar Info
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => {
                          setManageContentTrail(trail);
                          setManageContentOpen(true);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Gerenciar Conteúdo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Trail Dialog */}
      {editingTrail && (
        <EditTrailDialog 
          trail={{
            id: editingTrail.id,
            title: editingTrail.title,
            description: editingTrail.description || '',
            level: editingTrail.level as any,
            duration: editingTrail.duration || '',
            modules: [],
            certificateConfig: {
              enabled: editingTrail.certificate_enabled,
              type: editingTrail.certificate_type as any
            }
          }}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}

      {/* Manage Content Dialog */}
      <ManageTrailContentDialogNew 
        trail={manageContentTrail}
        open={manageContentOpen}
        onOpenChange={setManageContentOpen}
      />
    </div>
  );
};