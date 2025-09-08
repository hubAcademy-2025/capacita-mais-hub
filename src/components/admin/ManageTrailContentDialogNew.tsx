import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Video, FileText, Award, BookOpen } from 'lucide-react';
import { useModules, type Module } from '@/hooks/useModules';
import { useContent, type ContentItem } from '@/hooks/useContent';
import type { TrailWithDetails } from '@/hooks/useTrails';

interface ManageTrailContentDialogProps {
  trail: TrailWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageTrailContentDialogNew = ({ trail, open, onOpenChange }: ManageTrailContentDialogProps) => {
  const { modules, createModule, deleteModule } = useModules(trail?.id || null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const { content, createContent, deleteContent } = useContent(selectedModuleId);
  
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);
  
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order_index: 1,
  });

  const [contentForm, setContentForm] = useState({
    title: '',
    description: '',
    type: 'video' as ContentItem['type'],
    url: '',
    duration: '',
    order_index: 1,
  });

  const resetModuleForm = () => {
    setModuleForm({
      title: '',
      description: '',
      order_index: modules.length + 1,
    });
    setShowModuleForm(false);
  };

  const resetContentForm = () => {
    setContentForm({
      title: '',
      description: '',
      type: 'video',
      url: '',
      duration: '',
      order_index: content.length + 1,
    });
    setShowContentForm(false);
  };

  const handleAddModule = async () => {
    if (!moduleForm.title.trim()) return;

    try {
      await createModule({
        title: moduleForm.title,
        description: moduleForm.description || undefined,
        order_index: moduleForm.order_index
      });
      resetModuleForm();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleAddContent = async () => {
    if (!contentForm.title.trim() || !selectedModuleId) return;

    try {
      await createContent({
        title: contentForm.title,
        description: contentForm.description || undefined,
        type: contentForm.type,
        url: contentForm.url || undefined,
        duration: contentForm.duration || undefined,
        order_index: contentForm.order_index
      });
      resetContentForm();
    } catch (error) {
      // Error handled in hook
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'quiz':
        return <Award className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  if (!trail) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Gerenciar Conteúdo: {trail.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Modules Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Módulos ({modules.length})</h3>
              <Button onClick={() => setShowModuleForm(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Módulo
              </Button>
            </div>

            {/* Add Module Form */}
            {showModuleForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Novo Módulo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input
                        value={moduleForm.title}
                        onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Nome do módulo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ordem</Label>
                      <Input
                        type="number"
                        value={moduleForm.order_index}
                        onChange={(e) => setModuleForm(prev => ({ ...prev, order_index: parseInt(e.target.value) || 1 }))}
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do módulo"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddModule}>
                      Adicionar Módulo
                    </Button>
                    <Button variant="outline" onClick={resetModuleForm}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modules List */}
            {modules.map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{module.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Ordem {module.order_index}</Badge>
                      <Badge variant="secondary">{module.content_count || 0} conteúdos</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedModuleId(module.id);
                          setShowContentForm(true);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Conteúdo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteModule(module.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Content for this module */}
                {selectedModuleId === module.id && content.length > 0 && (
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <div className="space-y-2">
                      <h4 className="font-medium">Conteúdos</h4>
                      {content.map((contentItem) => (
                        <div key={contentItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-md">
                              {getContentIcon(contentItem.type)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{contentItem.title}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{contentItem.type}</Badge>
                                {contentItem.duration && (
                                  <span className="text-xs text-muted-foreground">{contentItem.duration}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteContent(contentItem.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Add Content Form */}
          {showContentForm && selectedModuleId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Adicionar Conteúdo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      value={contentForm.title}
                      onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Nome do conteúdo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={contentForm.type}
                      onValueChange={(value) => setContentForm(prev => ({ ...prev, type: value as ContentItem['type'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Vídeo</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="live">Ao Vivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={contentForm.description}
                    onChange={(e) => setContentForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do conteúdo"
                  />
                </div>

                {contentForm.type !== 'quiz' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>URL do Conteúdo</Label>
                      <Input
                        value={contentForm.url}
                        onChange={(e) => setContentForm(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duração</Label>
                      <Input
                        value={contentForm.duration}
                        onChange={(e) => setContentForm(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="Ex: 15min"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleAddContent}>
                    Adicionar Conteúdo
                  </Button>
                  <Button variant="outline" onClick={resetContentForm}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};