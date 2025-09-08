import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoPlayer } from '@/components/ui/video-player';
import { QuizPlayer } from '@/components/ui/quiz-player';
import { useAppStore } from '@/store/useAppStore';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useTrails } from '@/hooks/useTrails';
import { useModules } from '@/hooks/useModules';
import { useContent } from '@/hooks/useContent';
import { supabase } from '@/integrations/supabase/client';

export const AlunoSimpleContentViewerPage = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useSupabaseAuth();
  const { enrollments } = useEnrollments();
  const { trails } = useTrails();
  
  const [content, setContent] = useState<any>(null);
  const [module, setModule] = useState<any>(null);
  const [trail, setTrail] = useState<any>(null);
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

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <p>Carregando conteúdo...</p>
        </div>
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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/aluno')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{content.title}</h1>
            <p className="text-muted-foreground">
              {trail.title} • {module.title}
            </p>
          </div>
        </div>
        {isCompleted && (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Concluído
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
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
          <CardContent className="space-y-4">
            {(content.type === 'video' || content.type === 'live') && content.url && (
              <VideoPlayer
                url={content.url}
                title={content.title}
              />
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
    </div>
  );
};