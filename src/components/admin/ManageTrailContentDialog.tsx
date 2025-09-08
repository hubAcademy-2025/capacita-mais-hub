import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Video, FileText, HelpCircle, Radio, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { VideoPreview } from '@/components/admin/VideoPreview';
import { validateVideoUrl, convertToEmbedUrl } from '@/utils/videoUtils';
import type { Trail, Module, Content } from '@/types';

interface ManageTrailContentDialogProps {
  trail: Trail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageTrailContentDialog = ({ trail, open, onOpenChange }: ManageTrailContentDialogProps) => {
  const [localTrail, setLocalTrail] = useState<Trail | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState<string | null>(null);
  
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order: 1,
  });
  
  const [contentForm, setContentForm] = useState({
    title: '',
    description: '',
    type: 'video' as 'video' | 'pdf' | 'quiz' | 'live',
    url: '',
    duration: '',
    order: 1,
  });

  const { updateTrail } = useAppStore();
  const { toast } = useToast();

  useEffect(() => {
    if (trail) {
      setLocalTrail({ ...trail });
    }
  }, [trail]);

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4" />;
      case 'live':
        return <Radio className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleAddModule = () => {
    if (!localTrail || !moduleForm.title || !moduleForm.description) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos do módulo",
        variant: "destructive"
      });
      return;
    }

    const newModule: Module = {
      id: crypto.randomUUID(),
      title: moduleForm.title,
      description: moduleForm.description,
      content: [],
      order: moduleForm.order,
    };

    setLocalTrail(prev => prev ? {
      ...prev,
      modules: [...prev.modules, newModule].sort((a, b) => a.order - b.order)
    } : null);

    setModuleForm({ title: '', description: '', order: 1 });
    setShowModuleForm(false);

    toast({
      title: "Sucesso",
      description: "Módulo adicionado com sucesso",
    });
  };

  const handleDeleteModule = (moduleId: string) => {
    setLocalTrail(prev => prev ? {
      ...prev,
      modules: prev.modules.filter(m => m.id !== moduleId)
    } : null);

    toast({
      title: "Módulo removido",
      description: "O módulo foi removido com sucesso",
    });
  };

  const handleAddContent = (moduleId: string) => {
    if (!localTrail || !contentForm.title || !contentForm.type) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Validate video URL if it's a video content
    if (contentForm.type === 'video' && contentForm.url && !validateVideoUrl(contentForm.url)) {
      toast({
        title: "URL de vídeo inválida",
        description: "Por favor, use uma URL válida do YouTube ou Vimeo",
        variant: "destructive"
      });
      return;
    }

    // Convert video URL to embed format if it's a video
    let processedUrl = contentForm.url;
    if (contentForm.type === 'video' && contentForm.url) {
      const videoInfo = convertToEmbedUrl(contentForm.url);
      if (videoInfo.isValid && videoInfo.embedUrl) {
        processedUrl = videoInfo.embedUrl;
      }
    }

    const newContent: Content = {
      id: crypto.randomUUID(),
      title: contentForm.title,
      description: contentForm.description,
      type: contentForm.type,
      url: processedUrl,
      duration: contentForm.duration,
      order: contentForm.order,
    };

    setLocalTrail(prev => prev ? {
      ...prev,
      modules: prev.modules.map(module => 
        module.id === moduleId 
          ? { ...module, content: [...module.content, newContent].sort((a, b) => a.order - b.order) }
          : module
      )
    } : null);

    setContentForm({ title: '', description: '', type: 'video', url: '', duration: '', order: 1 });
    setShowContentForm(null);

    toast({
      title: "Sucesso",
      description: "Conteúdo adicionado com sucesso",
    });
  };

  const handleDeleteContent = (moduleId: string, contentId: string) => {
    setLocalTrail(prev => prev ? {
      ...prev,
      modules: prev.modules.map(module => 
        module.id === moduleId 
          ? { ...module, content: module.content.filter(c => c.id !== contentId) }
          : module
      )
    } : null);

    toast({
      title: "Conteúdo removido",
      description: "O conteúdo foi removido com sucesso",
    });
  };

  const handleSave = () => {
    if (!localTrail) return;

    updateTrail(localTrail);
    
    toast({
      title: "Sucesso",
      description: "Trilha atualizada com sucesso",
    });

    onOpenChange(false);
  };

  if (!localTrail) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Gerenciar Conteúdo: {localTrail.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Modules List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Módulos ({localTrail.modules.length})</h3>
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
                        value={moduleForm.order}
                        onChange={(e) => setModuleForm(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
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
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddModule}>
                      Adicionar Módulo
                    </Button>
                    <Button variant="outline" onClick={() => setShowModuleForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modules Accordion */}
            {localTrail.modules.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-2">
                {localTrail.modules.map((module) => (
                  <AccordionItem key={module.id} value={module.id} className="border rounded-lg">
                    <AccordionTrigger className="px-4">
                      <div className="flex items-center justify-between w-full mr-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{module.order}</Badge>
                          <span>{module.title}</span>
                          <Badge>{module.content.length} conteúdos</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModule(module.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                        
                        {/* Add Content Form */}
                        {showContentForm === module.id && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Novo Conteúdo</CardTitle>
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
                                    onValueChange={(value: 'video' | 'pdf' | 'quiz' | 'live') => 
                                      setContentForm(prev => ({ ...prev, type: value }))
                                    }
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
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>URL {contentForm.type === 'video' && <span className="text-xs text-muted-foreground">(YouTube ou Vimeo)</span>}</Label>
                                  <Input
                                    value={contentForm.url}
                                    onChange={(e) => setContentForm(prev => ({ ...prev, url: e.target.value }))}
                                    placeholder={contentForm.type === 'video' ? "https://www.youtube.com/watch?v=..." : "Link do conteúdo"}
                                  />
                                  {contentForm.type === 'video' && contentForm.url && !validateVideoUrl(contentForm.url) && (
                                    <div className="flex items-center gap-1 text-xs text-destructive">
                                      <AlertTriangle className="w-3 h-3" />
                                      URL não suportada. Use YouTube ou Vimeo.
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label>Duração</Label>
                                  <Input
                                    value={contentForm.duration}
                                    onChange={(e) => setContentForm(prev => ({ ...prev, duration: e.target.value }))}
                                    placeholder="Ex: 15 min"
                                  />
                                </div>
                              </div>
                              
                              {/* Video Preview */}
                              {contentForm.type === 'video' && contentForm.url && (
                                <VideoPreview url={contentForm.url} title={contentForm.title} />
                              )}
                              <div className="space-y-2">
                                <Label>Descrição</Label>
                                <Textarea
                                  value={contentForm.description}
                                  onChange={(e) => setContentForm(prev => ({ ...prev, description: e.target.value }))}
                                  placeholder="Descrição do conteúdo"
                                  rows={2}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={() => handleAddContent(module.id)}>
                                  Adicionar Conteúdo
                                </Button>
                                <Button variant="outline" onClick={() => setShowContentForm(null)}>
                                  Cancelar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Content List */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Conteúdos</h4>
                            {showContentForm !== module.id && (
                              <Button size="sm" variant="outline" onClick={() => setShowContentForm(module.id)}>
                                <Plus className="w-3 h-3 mr-1" />
                                Adicionar
                              </Button>
                            )}
                          </div>
                          
                          {module.content.length > 0 ? (
                            <div className="space-y-2">
                              {module.content.map((content) => (
                                <div key={content.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-3">
                                    {getContentIcon(content.type)}
                                    <div>
                                      <p className="font-medium text-sm">{content.title}</p>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Badge variant="secondary" className="text-xs">
                                          {content.type}
                                        </Badge>
                                        {content.duration && <span>{content.duration}</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteContent(module.id, content.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
                              Nenhum conteúdo adicionado ainda
                            </p>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                Nenhum módulo criado ainda. Clique em "Adicionar Módulo" para começar.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};