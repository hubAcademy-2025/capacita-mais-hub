import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Play, FileText, CheckCircle, Lock, ChevronRight, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { VideoPlayer } from '@/components/ui/video-player';
import { useAppStore } from '@/store/useAppStore';

export const AlunoContentViewerPage = () => {
  const { classId, trailId, moduleId, contentId } = useParams();
  const navigate = useNavigate();
  const { trails, userProgress, currentUser, classes, updateUserProgress } = useAppStore();
  
  const [openModules, setOpenModules] = useState<string[]>([]);
  
  // Find the module where the user left off (has incomplete content)
  const getUserLastModule = () => {
    if (!currentUser || !trail) return null;
    
    for (const mod of trail.modules) {
      const hasIncompleteContent = mod.content.some(cont => {
        const progress = userProgress.find(p => 
          p.userId === currentUser.id && p.contentId === cont.id
        );
        return !progress?.completed;
      });
      
      if (hasIncompleteContent) {
        return mod.id;
      }
    }
    return trail.modules[0]?.id; // Default to first module
  };
  
  const classroom = classes.find(c => c.id === classId);
  const trail = trails.find(t => t.id === trailId);
  const module = trail?.modules.find(m => m.id === moduleId);
  const content = module?.content.find(c => c.id === contentId);
  
  const userContentProgress = userProgress.find(p => 
    p.userId === currentUser?.id && p.contentId === contentId
  );

  useEffect(() => {
    const userLastModule = getUserLastModule();
    
    // Always open the current module and the user's last module
    const modulesToOpen = [moduleId, userLastModule].filter(Boolean) as string[];
    
    setOpenModules(prev => {
      const newModules = modulesToOpen.filter(id => !prev.includes(id));
      return [...prev, ...newModules];
    });
  }, [moduleId, currentUser, trail, userProgress]);

  if (!classroom || !trail || !module || !content) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Conteúdo não encontrado</h2>
          <p className="text-muted-foreground mb-4">O conteúdo solicitado não existe ou você não tem acesso a ele.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'quiz':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const isContentAccessible = (contentItem: any) => {
    return !contentItem.isBlocked;
  };

  const markContentAsCompleted = () => {
    if (!currentUser || !contentId) return;
    
    updateUserProgress(currentUser.id, contentId, {
      completed: true
    });
  };

  const getNextContent = () => {
    const allModules = trail.modules;
    let foundCurrent = false;
    
    for (const mod of allModules) {
      for (const cont of mod.content) {
        if (foundCurrent && isContentAccessible(cont)) {
          return { moduleId: mod.id, contentId: cont.id };
        }
        if (cont.id === contentId) {
          foundCurrent = true;
        }
      }
    }
    return null;
  };

  const navigateToContent = (modId: string, contId: string) => {
    navigate(`/aluno/content/${contId}`);
  };

  const nextContent = getNextContent();

  const toggleModule = (modId: string) => {
    setOpenModules(prev => 
      prev.includes(modId) 
        ? prev.filter(id => id !== modId)
        : [...prev, modId]
    );
  };

  const renderContent = () => {
    switch (content.type) {
        case 'video':
          return (
            <div className="space-y-4">
              <VideoPlayer
                url={content.url || ''}
                title={content.title}
                duration={content.duration}
                contentId={content.id}
                userId={currentUser?.id}
                enableTracking={true}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={userContentProgress?.completed ? "default" : "secondary"}>
                    {userContentProgress?.completed ? "Concluído" : "Em andamento"}
                  </Badge>
                </div>
                
                {!userContentProgress?.completed && (
                  <Button onClick={markContentAsCompleted} size="sm" variant="outline">
                    Marcar como Concluído Manualmente
                  </Button>
                )}
              </div>
            </div>
          );
      
      case 'pdf':
        return (
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">Documento PDF</p>
                <p className="text-sm text-muted-foreground mb-4">Clique para abrir em nova aba</p>
                <Button onClick={() => window.open(content.url, '_blank')}>
                  Abrir PDF
                </Button>
              </div>
            </div>
            
            {!userContentProgress?.completed && (
              <div className="text-center">
                <Button onClick={markContentAsCompleted} size="sm">
                  Marcar como Concluído
                </Button>
              </div>
            )}
          </div>
        );
      
      case 'quiz':
        return (
          <div className="space-y-4">
            {content.quiz ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-medium mb-2">Quiz: {content.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Quiz com {content.quiz.questions.length} perguntas
                  </p>
                  <Button onClick={() => markContentAsCompleted()}>
                    Iniciar Quiz
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Quiz não configurado</h3>
                  <p className="text-sm text-muted-foreground">
                    Este quiz ainda não foi configurado pelo professor.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );
      
      default:
        return (
          <div className="bg-muted rounded-lg p-8 text-center">
            <p className="text-muted-foreground">Tipo de conteúdo não suportado: {content.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <div className="w-80 bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/aluno/turma/${classId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Turma
          </Button>
          
          <div className="mt-4">
            <h3 className="font-semibold text-lg">{trail.title}</h3>
            <p className="text-sm text-muted-foreground">{classroom.name}</p>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-4 space-y-2">
            {trail.modules.map((mod) => (
              <Collapsible 
                key={mod.id} 
                open={openModules.includes(mod.id)}
                onOpenChange={() => toggleModule(mod.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start p-3 h-auto"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {openModules.includes(mod.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <span className="font-medium">{mod.title}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {mod.content.length} itens
                      </Badge>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="pl-6 space-y-1">
                  {mod.content.map((cont) => {
                    const isBlocked = cont.isBlocked;
                    const isCompleted = userProgress.some(p => 
                      p.userId === currentUser?.id && p.contentId === cont.id && p.completed
                    );
                    const isCurrent = cont.id === contentId;
                    
                    return (
                      <Button
                        key={cont.id}
                        variant={isCurrent ? "secondary" : "ghost"}
                        size="sm"
                        className={`w-full justify-start h-auto p-2 ${
                          isBlocked ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => !isBlocked && navigateToContent(mod.id, cont.id)}
                        disabled={isBlocked}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex items-center gap-2">
                            {isBlocked ? (
                              <Lock className="w-3 h-3" />
                            ) : isCompleted ? (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : (
                              getContentIcon(cont.type)
                            )}
                            <span className="text-xs">{cont.title}</span>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Content Header */}
        <div className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getContentIcon(content.type)}
              <div>
                <h1 className="text-2xl font-bold">{content.title}</h1>
                <p className="text-muted-foreground">{module.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {userContentProgress?.completed && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Concluído
                </Badge>
              )}
              <Badge variant="outline">
                {content.type}
              </Badge>
            </div>
          </div>

          {content.description && (
            <p className="text-muted-foreground">{content.description}</p>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            {renderContent()}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              
              {nextContent && (
                <Button 
                  onClick={() => navigateToContent(nextContent.moduleId, nextContent.contentId)}
                >
                  Próximo Conteúdo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};