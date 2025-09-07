import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, FileText, CheckCircle, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/useAppStore';

export const ProfessorContentViewerPage = () => {
  const { trailId, moduleId, contentId } = useParams();
  const navigate = useNavigate();
  const { trails, userProgress, currentUser } = useAppStore();
  
  const trail = trails.find(t => t.id === trailId);
  const module = trail?.modules.find(m => m.id === moduleId);
  const content = module?.content.find(c => c.id === contentId);
  
  if (!trail || !module || !content) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Conteúdo não encontrado</h2>
          <p className="text-muted-foreground mb-4">O conteúdo solicitado não existe ou foi removido.</p>
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
        return <Play className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'quiz':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const renderContent = () => {
    switch (content.type) {
      case 'video':
        return (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">Visualização de Vídeo</p>
              <p className="text-sm text-muted-foreground">URL: {content.url}</p>
              <p className="text-xs text-muted-foreground mt-2">Duração: {content.duration || 'N/A'}</p>
            </div>
          </div>
        );
      
      case 'pdf':
        return (
          <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">Documento PDF</p>
              <p className="text-sm text-muted-foreground">URL: {content.url}</p>
              <Button className="mt-4" onClick={() => window.open(content.url, '_blank')}>
                Abrir PDF
              </Button>
            </div>
          </div>
        );
      
      case 'quiz':
        return (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-6 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">Quiz Interativo</p>
              <p className="text-sm text-muted-foreground">Como professor, você pode visualizar e editar as questões</p>
            </div>
            
            {(content as any).questions && (content as any).questions.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Questões do Quiz:</h3>
                {(content as any).questions.map((question: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <p className="font-medium mb-2">{index + 1}. {question.question}</p>
                      <div className="space-y-1">
                        {question.options.map((option: string, optIndex: number) => (
                          <div key={optIndex} className={`p-2 rounded text-sm ${
                            optIndex === question.correctAnswer 
                              ? 'bg-green-100 text-green-800 font-medium' 
                              : 'bg-muted'
                          }`}>
                            {String.fromCharCode(65 + optIndex)}. {option}
                            {optIndex === question.correctAnswer && ' ✓ (Resposta Correta)'}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getContentIcon(content.type)}
              <h1 className="text-xl font-bold">{content.title}</h1>
              <Badge variant={content.isBlocked ? 'destructive' : 'default'}>
                {content.isBlocked ? 'Bloqueado' : 'Ativo'}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {trail.title} • {module.title}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Content Description */}
          {content.description && (
            <Card>
              <CardContent className="p-4">
                <p className="text-muted-foreground">{content.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <Card>
            <CardContent className="p-6">
              {renderContent()}
            </CardContent>
          </Card>

          {/* Content Meta Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Conteúdo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium">Tipo</p>
                  <p className="text-muted-foreground capitalize">{content.type}</p>
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <p className="text-muted-foreground">
                    {content.isBlocked ? 'Bloqueado' : 'Ativo'}
                  </p>
                </div>
                {content.duration && (
                  <div>
                    <p className="font-medium">Duração</p>
                    <p className="text-muted-foreground">{content.duration}</p>
                  </div>
                )}
                {(content as any).points && (
                  <div>
                    <p className="font-medium">Pontos</p>
                    <p className="text-muted-foreground">{(content as any).points} pts</p>
                  </div>
                )}
              </div>
              
              {content.url && (
                <div>
                  <p className="font-medium text-sm">URL do Recurso</p>
                  <p className="text-xs text-muted-foreground break-all">{content.url}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};