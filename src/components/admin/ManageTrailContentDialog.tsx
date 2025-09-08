import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Video, FileText, Award, BookOpen, Settings } from 'lucide-react';
import { QuizEditorDialog } from '@/components/admin/QuizEditorDialog';
import { VideoPreview } from '@/components/admin/VideoPreview';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import type { Trail, Module, Content, Quiz } from '@/types';

interface ManageTrailContentDialogProps {
  trail: Trail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageTrailContentDialog = ({ trail, open, onOpenChange }: ManageTrailContentDialogProps) => {
  const [localTrail, setLocalTrail] = useState<Trail | null>(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState<string | null>(null);
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order: 1,
  });

  const [contentForm, setContentForm] = useState({
    title: '',
    description: '',
    type: 'video' as Content['type'],
    url: '',
    duration: '',
    order: 1,
    quiz: null as Quiz | null,
  });

  const { updateTrail } = useAppStore();
  const { toast } = useToast();

  useEffect(() => {
    if (trail) {
      setLocalTrail(trail);
      setModuleForm({ title: '', description: '', order: trail.modules.length + 1 });
    }
  }, [trail]);

  const resetContentForm = () => {
    setContentForm({
      title: '',
      description: '',
      type: 'video',
      url: '',
      duration: '',
      order: 1,
      quiz: null,
    });
    setCurrentContent(null);
    setShowContentForm(null);
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

    setModuleForm({ title: '', description: '', order: (localTrail.modules.length + 2) });
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
    if (!contentForm.title || !contentForm.type) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (contentForm.type === 'quiz' && !contentForm.quiz) {
      toast({
        title: "Erro",
        description: "Configure o quiz antes de salvar",
        variant: "destructive"
      });
      return;
    }

    const newContent: Content = {
      id: currentContent?.id || crypto.randomUUID(),
      title: contentForm.title,
      description: contentForm.description,
      type: contentForm.type,
      url: contentForm.url,
      duration: contentForm.duration,
      order: contentForm.order,
      quiz: contentForm.quiz,
    };

    setLocalTrail(prev => prev ? {
      ...prev,
      modules: prev.modules.map(module => 
        module.id === moduleId 
          ? { 
              ...module, 
              content: currentContent 
                ? module.content.map(c => c.id === currentContent.id ? newContent : c)
                : [...module.content, newContent].sort((a, b) => a.order - b.order)
            }
          : module
      )
    } : null);

    resetContentForm();

    toast({
      title: "Sucesso",
      description: currentContent ? "Conteúdo atualizado" : "Conteúdo adicionado",
    });
  };

  const handleEditContent = (moduleId: string, content: Content) => {
    setCurrentContent(content);
    setContentForm({
      title: content.title,
      description: content.description || '',
      type: content.type,
      url: content.url || '',
      duration: content.duration || '',
      order: content.order,
      quiz: content.quiz || null,
    });
    setShowContentForm(moduleId);
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

  const handleOpenQuizEditor = () => {
    setEditingQuiz(contentForm.quiz || null);
    setShowQuizEditor(true);
  };

  const handleSaveQuiz = (quiz: Quiz) => {
    setContentForm(prev => ({
      ...prev,
      quiz: quiz
    }));
    setShowQuizEditor(false);
    toast({
      title: "Sucesso",
      description: "Quiz configurado com sucesso"
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

  if (!localTrail) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
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

              {/* Modules */}
              {localTrail.modules.map((module) => (
                <Card key={module.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{module.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Ordem {module.order}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowContentForm(module.id)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Conteúdo
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteModule(module.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {/* Add Content Form */}
                  {showContentForm === module.id && (
                    <CardContent className="pt-0">
                      <Separator className="mb-4" />
                      <div className="space-y-4">
                        <h4 className="font-medium">
                          {currentContent ? 'Editar Conteúdo' : 'Adicionar Conteúdo'}
                        </h4>
                        
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
                              onValueChange={(value) => setContentForm(prev => ({ ...prev, type: value as Content['type'] }))}
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

                        {contentForm.type === 'quiz' ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h5 className="font-medium">Configuração do Quiz</h5>
                                <p className="text-sm text-muted-foreground">
                                  {contentForm.quiz 
                                    ? `${contentForm.quiz.questions.length} perguntas configuradas`
                                    : 'Nenhum quiz configurado'
                                  }
                                </p>
                              </div>
                              <Button onClick={handleOpenQuizEditor}>
                                <Settings className="w-4 h-4 mr-2" />
                                {contentForm.quiz ? 'Editar Quiz' : 'Configurar Quiz'}
                              </Button>
                            </div>
                          </div>
                        ) : (
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

                        {contentForm.type === 'video' && contentForm.url && (
                          <VideoPreview url={contentForm.url} />
                        )}

                        <div className="flex gap-2">
                          <Button onClick={() => handleAddContent(module.id)}>
                            {currentContent ? 'Atualizar' : 'Adicionar'} Conteúdo
                          </Button>
                          <Button variant="outline" onClick={resetContentForm}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}

                  {/* Content List */}
                  {module.content.length > 0 && (
                    <CardContent className="pt-0">
                      <Separator className="mb-4" />
                      <div className="space-y-2">
                        <h4 className="font-medium">Conteúdos ({module.content.length})</h4>
                        {module.content.map((content) => (
                          <div key={content.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-muted rounded-md">
                                {getContentIcon(content.type)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{content.title}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{content.type}</Badge>
                                  {content.duration && (
                                    <span className="text-xs text-muted-foreground">{content.duration}</span>
                                  )}
                                  {content.quiz && (
                                    <span className="text-xs text-muted-foreground">
                                      {content.quiz.questions.length} perguntas
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditContent(module.id, content)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteContent(module.id, content.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar Trilha
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quiz Editor Dialog */}
      <QuizEditorDialog
        quiz={editingQuiz}
        open={showQuizEditor}
        onOpenChange={setShowQuizEditor}
        onSave={handleSaveQuiz}
      />
    </>
  );
};