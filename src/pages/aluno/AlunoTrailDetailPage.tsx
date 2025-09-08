import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, FileText, CheckCircle, Book, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useTrails } from '@/hooks/useTrails';
import { useModules } from '@/hooks/useModules';
import { useContent } from '@/hooks/useContent';
import { supabase } from '@/integrations/supabase/client';

// Component to display module content
const ModuleContent = ({ moduleId, userProgress }: { moduleId: string, userProgress: any[] }) => {
  const { content } = useContent(moduleId);
  const navigate = useNavigate();

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'quiz': return <CheckCircle className="w-4 h-4" />;
      default: return <Book className="w-4 h-4" />;
    }
  };

  const getContentProgress = (contentId: string) => {
    return userProgress.find(p => p.content_id === contentId);
  };

  return (
    <>
      {content.map((contentItem: any, contentIndex: number) => {
        const progress = getContentProgress(contentItem.id);
        const isCompleted = progress?.completed;
        
        return (
          <div
            key={contentItem.id}
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
              isCompleted ? 'bg-green-50 border-green-200' : ''
            }`}
            onClick={() => navigate(`/aluno/content/${contentItem.id}`)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{contentIndex + 1}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getContentIcon(contentItem.type)}
                <div>
                  <h4 className="font-medium">{contentItem.title}</h4>
                  {contentItem.description && (
                    <p className="text-sm text-muted-foreground">
                      {contentItem.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {contentItem.duration && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {contentItem.duration}
                </div>
              )}
              <Badge variant={contentItem.type === 'video' ? 'default' : contentItem.type === 'quiz' ? 'destructive' : 'secondary'}>
                {contentItem.type}
              </Badge>
              {isCompleted && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

export const AlunoTrailDetailPage = () => {
  const { trailId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useSupabaseAuth();
  const { trails } = useTrails();
  const [openModules, setOpenModules] = useState<string[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);

  const trail = trails.find(t => t.id === trailId);
  const { modules } = useModules(trailId);

  // Fetch user progress
  React.useEffect(() => {
    if (userProfile) {
      const fetchProgress = async () => {
        const { data } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userProfile.id);
        setUserProgress(data || []);
      };
      fetchProgress();
    }
  }, [userProfile]);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'quiz': return <CheckCircle className="w-4 h-4" />;
      default: return <Book className="w-4 h-4" />;
    }
  };

  const getContentProgress = (contentId: string) => {
    return userProgress.find(p => p.content_id === contentId);
  };

  const calculateModuleProgress = (module: any) => {
    if (!module.content_count || module.content_count === 0) return 0;
    // For now, we'll need to fetch content separately or use a simplified progress calculation
    return 0; // Placeholder - will be properly calculated when content is loaded
  };

  const calculateTrailProgress = () => {
    if (!modules.length) return 0;
    const totalProgress = modules.reduce((acc, module) => acc + calculateModuleProgress(module), 0);
    return Math.round(totalProgress / modules.length);
  };

  if (!trail) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Trilha não encontrada</h1>
          <p className="text-muted-foreground mb-4">
            A trilha que você está procurando não foi encontrada.
          </p>
          <Button onClick={() => navigate('/aluno/trilhas')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar às Trilhas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/aluno/trilhas')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{trail.title}</h1>
            <p className="text-muted-foreground">{trail.description}</p>
          </div>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="mb-2">
            {trail.level} • {trail.duration}
          </Badge>
          <div className="text-sm text-muted-foreground">
            Progresso: {calculateTrailProgress()}%
          </div>
          <Progress value={calculateTrailProgress()} className="w-24" />
        </div>
      </div>

      {/* Modules and Content */}
      <div className="space-y-4">
        {modules.map((module, moduleIndex) => {
          const isOpen = openModules.includes(module.id);
          const moduleProgress = calculateModuleProgress(module);
          
          return (
            <Card key={module.id}>
              <Collapsible>
                <CollapsibleTrigger 
                  className="w-full" 
                  onClick={() => toggleModule(module.id)}
                >
                  <CardHeader className="hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          {moduleIndex + 1}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          {module.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {module.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{moduleProgress}%</div>
                          <Progress value={moduleProgress} className="w-20" />
                        </div>
                        <Badge variant={moduleProgress === 100 ? "default" : "secondary"}>
                          {module.content_count || 0} conteúdos
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <ModuleContent moduleId={module.id} userProgress={userProgress} />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
};