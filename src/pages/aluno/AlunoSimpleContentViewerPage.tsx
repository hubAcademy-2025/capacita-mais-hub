import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoPlayer } from '@/components/ui/video-player';
import { QuizPlayer } from '@/components/ui/quiz-player';
import { useAppStore } from '@/store/useAppStore';

export const AlunoSimpleContentViewerPage = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const { trails, userProgress, currentUser, updateUserProgress, enrollments, classes } = useAppStore();
  
  // Find content across all trails and modules
  const findContentById = (id: string) => {
    for (const trail of trails) {
      for (const module of trail.modules) {
        const content = module.content.find(c => c.id === id);
        if (content) {
          return { content, module, trail };
        }
      }
    }
    return null;
  };

  const result = contentId ? findContentById(contentId) : null;
  const content = result?.content;
  const module = result?.module;
  const trail = result?.trail;

  // Check if user has access to this content
  const hasAccess = () => {
    if (!currentUser || !trail) return false;
    
    const studentEnrollments = enrollments.filter(e => e.studentId === currentUser.id);
    const studentClasses = classes.filter(c => studentEnrollments.some(e => e.classId === c.id));
    
    return studentClasses.some(c => 
      (c.trailIds && c.trailIds.includes(trail.id)) || c.trailId === trail.id
    );
  };

  const userContentProgress = userProgress.find(p => 
    p.userId === currentUser?.id && p.contentId === contentId
  );

  const markAsCompleted = () => {
    if (currentUser && content) {
      updateUserProgress(currentUser.id, content.id, { 
        completed: true, 
        percentage: 100,
        lastAccessed: new Date().toISOString()
      });
    }
  };

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

  const isCompleted = userContentProgress?.completed || false;

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