import { useState } from 'react';
import { Play, FileText, Brain, Lock, CheckCircle, Circle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAppStore } from '@/store/useAppStore';
import { Trail, Module, Content } from '@/types';

interface TrilhaTabProps {
  trails: Trail[];
}

export const TrilhaTab = ({ trails }: TrilhaTabProps) => {
  const { currentUser, userProgress, updateUserProgress, badges, userPoints, classes, enrollments } = useAppStore();
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  const getUserProgress = (contentId: string) => {
    return userProgress.find(p => p.userId === currentUser?.id && p.contentId === contentId);
  };

  const calculateModuleProgress = (module: Module) => {
    const totalContent = module.content.length;
    const completedContent = module.content.filter(c => {
      const progress = getUserProgress(c.id);
      return progress?.completed;
    }).length;
    return totalContent > 0 ? (completedContent / totalContent) * 100 : 0;
  };

  const calculateTrailProgress = (trail: Trail) => {
    const allContent = trail.modules.flatMap(m => m.content);
    const completedContent = allContent.filter(c => {
      const progress = getUserProgress(c.id);
      return progress?.completed;
    }).length;
    return allContent.length > 0 ? (completedContent / allContent.length) * 100 : 0;
  };

  const handleContentClick = (content: Content, trail: Trail, module: Module) => {
    if (content.isBlocked) return;
    
    // Find the class that contains this trail
    const studentEnrollments = enrollments.filter(e => e.studentId === currentUser?.id);
    const studentClasses = classes.filter(c => studentEnrollments.some(e => e.classId === c.id));
    const trailClass = studentClasses.find(c => 
      (c.trailIds && c.trailIds.includes(trail.id)) || c.trailId === trail.id
    );
    
    if (trailClass) {
      // Navigate to the content viewer page
      window.location.href = `/aluno/turma/${trailClass.id}/trilha/${trail.id}/modulo/${module.id}/conteudo/${content.id}`;
    } else {
      // Fallback to content selection if no class found
      setSelectedContent(content);
      
      if (currentUser) {
        updateUserProgress(currentUser.id, content.id, {
          lastAccessed: new Date().toISOString()
        });
      }
    }
  };

  const markContentAsCompleted = (content: Content) => {
    if (!currentUser) return;
    
    updateUserProgress(currentUser.id, content.id, {
      completed: true,
      percentage: 100,
      lastAccessed: new Date().toISOString()
    });
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'quiz':
        return <Brain className="w-4 h-4" />;
      case 'live':
        return <Play className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const userPointsData = userPoints.find(up => up.userId === currentUser?.id);
  const earnedBadges = badges.filter(b => userPointsData?.badges.includes(b.id));

  return (
    <div className="space-y-6">
      {/* Gamification Section */}
      {userPointsData && (
        <Card className="bg-gradient-to-r from-primary-light to-accent-light">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Seu Progresso</h3>
                <p className="text-sm opacity-80">Total de pontos: {userPointsData.totalPoints}</p>
              </div>
              <div className="flex gap-2">
                {earnedBadges.map(badge => (
                  <div key={badge.id} className="text-center">
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <Badge variant="secondary" className="text-xs">
                      {badge.name}
                    </Badge>
                  </div>
                ))}
                {earnedBadges.length === 0 && (
                  <div className="text-center text-muted-foreground">
                    <Award className="w-8 h-8 mx-auto mb-1" />
                    <p className="text-xs">Nenhuma badge ainda</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trails */}
      <div className="space-y-4">
        {trails.map((trail) => {
          const trailProgress = calculateTrailProgress(trail);
          const isTrailBlocked = trail.isBlocked;

          return (
            <Card key={trail.id} className={isTrailBlocked ? 'opacity-50' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {isTrailBlocked && <Lock className="w-5 h-5 text-muted-foreground" />}
                      {trail.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {trail.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline">{trail.level}</Badge>
                      <span className="text-sm text-muted-foreground">{trail.duration}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{Math.round(trailProgress)}%</div>
                    <Progress value={trailProgress} className="w-20 mt-1" />
                  </div>
                </div>
              </CardHeader>

              {!isTrailBlocked && (
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {trail.modules.map((module) => {
                      const moduleProgress = calculateModuleProgress(module);
                      const isModuleBlocked = module.isBlocked;

                      return (
                        <AccordionItem key={module.id} value={module.id}>
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center justify-between w-full mr-4">
                              <div className="flex items-center gap-2">
                                {isModuleBlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                                <span>{module.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={moduleProgress} className="w-16" />
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(moduleProgress)}%
                                </span>
                              </div>
                            </div>
                          </AccordionTrigger>

                          {!isModuleBlocked && (
                            <AccordionContent>
                              <div className="space-y-2 pl-4">
                                {module.content
                                  .sort((a, b) => a.order - b.order)
                                  .map((content) => {
                                    const progress = getUserProgress(content.id);
                                    const isCompleted = progress?.completed;
                                    const isContentBlocked = content.isBlocked;

                                    return (
                                      <div
                                        key={content.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                          isContentBlocked
                                            ? 'opacity-50 cursor-not-allowed'
                                            : selectedContent?.id === content.id
                                            ? 'bg-primary-light border-primary'
                                            : 'bg-muted/50 hover:bg-muted cursor-pointer'
                                        }`}
                                        onClick={() => handleContentClick(content, trail, module)}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="flex items-center gap-2">
                                            {isContentBlocked ? (
                                              <Lock className="w-4 h-4 text-muted-foreground" />
                                            ) : isCompleted ? (
                                              <CheckCircle className="w-4 h-4 text-success" />
                                            ) : (
                                              getContentIcon(content.type)
                                            )}
                                          </div>
                                          <div>
                                            <p className="font-medium text-sm">{content.title}</p>
                                            {content.duration && (
                                              <p className="text-xs text-muted-foreground">
                                                {content.duration}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        {!isContentBlocked && !isCompleted && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              markContentAsCompleted(content);
                                            }}
                                          >
                                            Marcar como concluído
                                          </Button>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            </AccordionContent>
                          )}
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Content Viewer */}
      {selectedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getContentIcon(selectedContent.type)}
              {selectedContent.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">
                {selectedContent.type === 'video' && '🎬'}
                {selectedContent.type === 'pdf' && '📄'}
                {selectedContent.type === 'quiz' && '🧠'}
                {selectedContent.type === 'live' && '📺'}
              </div>
              <h3 className="font-semibold mb-2">Visualizador de Conteúdo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedContent.description}
              </p>
              <Badge variant="outline">
                Tipo: {selectedContent.type}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};