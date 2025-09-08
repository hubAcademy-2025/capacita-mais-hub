import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, FileText, CheckCircle, BookOpen, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoPlayer } from '@/components/ui/video-player';
import { QuizPlayer } from '@/components/ui/quiz-player';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useEnrollments } from '@/hooks/useEnrollments';
import { supabase } from '@/integrations/supabase/client';

export const AlunoSimpleContentViewerPage = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useSupabaseAuth();
  const { enrollments } = useEnrollments();
  
  const [content, setContent] = useState<any>(null);
  const [module, setModule] = useState<any>(null);
  const [trail, setTrail] = useState<any>(null);
  const [allModules, setAllModules] = useState<any[]>([]);
  const [moduleContents, setModuleContents] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContentData = async () => {
      if (!contentId) return;

      try {
        // Fetch content with module and trail info
        const { data: contentData, error: contentError } = await supabase
          .from('content')
          .select(`
            *,
            modules:module_id (
              *,
              trails:trail_id (*)
            )
          `)
          .eq('id', contentId)
          .single();

        if (contentError) throw contentError;
        if (!contentData || !contentData.modules) {
          setContent(null);
          setLoading(false);
          return;
        }

        setContent(contentData);
        setModule(contentData.modules);
        setTrail(contentData.modules.trails);

        // Fetch all modules in this trail
        const { data: modulesData } = await supabase
          .from('modules')
          .select('*')
          .eq('trail_id', contentData.modules.trail_id)
          .order('order_index');

        setAllModules(modulesData || []);

        // Fetch all content for the current module
        const { data: contentsData } = await supabase
          .from('content')
          .select('*')
          .eq('module_id', contentData.module_id)
          .order('order_index');

        setModuleContents(contentsData || []);

        // Fetch user progress for this content
        if (userProfile) {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userProfile.id)
            .eq('content_id', contentId)
            .maybeSingle();

          setUserProgress(progressData);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContentData();
  }, [contentId, userProfile]);

  // Check if user has access to this content
  const hasAccess = () => {
    if (!userProfile || !trail) return false;
    
    const studentEnrollments = enrollments.filter(e => e.student_id === userProfile.id);
    return studentEnrollments.some(enrollment => {
      // Check if user is enrolled in a class that has access to this trail
      // This would need to be implemented based on class_trails table
      return true; // For now, allow access if user has any enrollment
    });
  };

  const markAsCompleted = async () => {
    if (!userProfile || !content) return;

    try {
      const progressData = {
        user_id: userProfile.id,
        content_id: content.id,
        completed: true,
        percentage: 100,
        last_accessed: new Date().toISOString()
      };

      if (userProgress) {
        await supabase
          .from('user_progress')
          .update(progressData)
          .eq('id', userProgress.id);
      } else {
        await supabase
          .from('user_progress')
          .insert([progressData]);
      }

      setUserProgress({ ...userProgress, ...progressData });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
      case 'live':
        return Play;
      case 'quiz':
        return CheckCircle;
      case 'pdf':
        return FileText;
      default:
        return FileText;
    }
  };

  const AppSidebar = () => (
    <Sidebar className="w-80 border-r bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <SidebarTrigger className="m-4" />
      </div>
      <SidebarContent>
        <div className="p-4 border-b bg-card">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/aluno/trilhas')}
            className="mb-2 w-full justify-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar às Trilhas
          </Button>
          <h2 className="font-semibold text-lg">{trail?.title}</h2>
          <p className="text-sm text-muted-foreground">{trail?.description}</p>
        </div>

        {allModules.map((mod) => (
          <SidebarGroup key={mod.id}>
            <SidebarGroupLabel className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {mod.title}
              </span>
              <ChevronRight className="w-4 h-4" />
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mod.id === module?.id && moduleContents.map((contentItem) => {
                  const Icon = getContentIcon(contentItem.type);
                  const isActive = contentItem.id === contentId;
                  
                  return (
                    <SidebarMenuItem key={contentItem.id}>
                      <SidebarMenuButton 
                        asChild
                        className={`${isActive ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "hover:bg-muted/50"} relative z-10`}
                      >
                        <button
                          onClick={() => navigate(`/aluno/content/${contentItem.id}`)}
                          className="w-full flex items-center gap-2 text-left p-2 rounded"
                        >
                          <Icon className="w-4 h-4" />
                          <span className="truncate">{contentItem.title}</span>
                          {userProgress?.completed && (
                            <CheckCircle className="w-3 h-3 text-green-500 ml-auto" />
                          )}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando conteúdo...</p>
      </div>
    );
  }

  if (!content || !module || !trail) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Conteúdo não encontrado</h1>
          <p className="text-muted-foreground mb-4">
            O conteúdo que você está procurando não foi encontrado.
          </p>
          <Button onClick={() => navigate('/aluno')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!hasAccess()) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso negado</h1>
          <p className="text-muted-foreground mb-4">
            Você não tem acesso a este conteúdo. Verifique se está matriculado na turma correspondente.
          </p>
          <Button onClick={() => navigate('/aluno')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isCompleted = userProgress?.completed || false;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 relative">
          {/* Fixed Header */}
          <div className="sticky top-0 z-40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b">
            <div className="flex items-center justify-between p-4">
              <div>
                <h1 className="text-2xl font-bold">{content.title}</h1>
                <p className="text-muted-foreground">
                  {trail.title} • {module.title}
                </p>
              </div>
              {isCompleted && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Concluído
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <Card className="relative z-10 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {content.type === 'video' && <Play className="w-5 h-5" />}
                  {content.type === 'pdf' && <FileText className="w-5 h-5" />}
                  {content.title}
                </CardTitle>
                {content.description && (
                  <p className="text-muted-foreground">{content.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4 relative z-20">
                {(content.type === 'video' || content.type === 'live') && content.url && (
                  <div className="relative z-10 bg-background rounded-lg overflow-hidden">
                    <VideoPlayer
                      url={content.url}
                      title={content.title}
                    />
                  </div>
                )}

                {content.type === 'quiz' && content.quiz && (
                  <QuizPlayer
                    quiz={content.quiz}
                    onComplete={(score, answers) => {
                      console.log('Quiz completed:', { score, answers });
                      markAsCompleted();
                    }}
                    onMarkCompleted={markAsCompleted}
                  />
                )}

                {content.type === 'pdf' && content.description && (
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap">{content.description}</div>
                    {!isCompleted && (
                      <div className="mt-6">
                        <Button onClick={markAsCompleted}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marcar como Concluído
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};