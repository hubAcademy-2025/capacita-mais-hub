import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, FileText, CheckCircle, Lock, Clock, Users, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/useAppStore';

export const ClassroomPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { classes, trails, enrollments, currentUser, userProgress } = useAppStore();
  
  const classroom = classes.find(c => c.id === classId);
  // Handle multiple trails for a class - get first available trail
  const trail = classroom ? trails.find(t => 
    (classroom.trailIds && classroom.trailIds.includes(t.id)) || 
    classroom.trailId === t.id
  ) : null;
  const enrollment = enrollments.find(e => 
    e.classId === classId && e.studentId === currentUser?.id
  );

  if (!classroom || !trail) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Turma não encontrada</h2>
          <p className="text-muted-foreground mb-4">
            Você não tem acesso a esta turma ou ela não existe.
          </p>
          <Button onClick={() => navigate('/aluno')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
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

  const isContentCompleted = (contentId: string) => {
    return userProgress.some(p => 
      p.userId === currentUser?.id && p.contentId === contentId && p.completed
    );
  };

  const getModuleProgress = (moduleId: string) => {
    const module = trail.modules.find(m => m.id === moduleId);
    if (!module) return 0;
    
    const completed = module.content.filter(c => isContentCompleted(c.id)).length;
    return module.content.length > 0 ? (completed / module.content.length) * 100 : 0;
  };

  const startLearning = () => {
    if (trail.modules.length > 0) {
      const firstModule = trail.modules[0];
      if (firstModule.content.length > 0) {
        const firstContent = firstModule.content[0];
        navigate(`/aluno/content/${firstContent.id}`);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/aluno')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{classroom.name}</h1>
          <p className="text-muted-foreground">{trail.title}</p>
        </div>
      </div>

      {/* Class Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progresso</p>
                <p className="text-2xl font-bold">{enrollment?.progress || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alunos</p>
                <p className="text-2xl font-bold">{classroom.studentIds.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duração</p>
                <p className="text-2xl font-bold">{trail.duration}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trail Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Conteúdo da Trilha
            </CardTitle>
            <Button onClick={startLearning}>
              <Play className="w-4 h-4 mr-2" />
              Iniciar Aprendizado
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {trail.modules.map((module) => (
              <div key={module.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{module.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {getModuleProgress(module.id).toFixed(0)}%
                    </span>
                    <Progress value={getModuleProgress(module.id)} className="w-24" />
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">{module.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {module.content.map((content) => {
                    const isCompleted = isContentCompleted(content.id);
                    const isBlocked = content.isBlocked;
                    
                    return (
                      <div 
                        key={content.id} 
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isBlocked 
                            ? 'opacity-50 cursor-not-allowed bg-muted' 
                            : isCompleted 
                              ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                              : 'hover:bg-secondary'
                        }`}
                        onClick={() => {
                          if (!isBlocked) {
                            navigate(`/aluno/content/${content.id}`);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {isBlocked ? (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          ) : isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            getContentIcon(content.type)
                          )}
                          <span className="font-medium text-sm">{content.title}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {content.type}
                          </Badge>
                          {content.duration && (
                            <span className="text-xs text-muted-foreground">
                              {content.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};