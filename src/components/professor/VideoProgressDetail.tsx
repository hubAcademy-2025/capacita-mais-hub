import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Eye, 
  BarChart3,
  Users,
  Video,
  FileText,
  Award
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Trail, User, Content, UserProgress } from '@/types';

interface VideoProgressDetailProps {
  trail: Trail;
  students: User[];
  classId: string;
}

export const VideoProgressDetail = ({ trail, students, classId }: VideoProgressDetailProps) => {
  const { userProgress } = useAppStore();
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'quiz':
        return <Award className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const getStudentProgress = (studentId: string, contentId: string): UserProgress | undefined => {
    return userProgress.find(p => p.userId === studentId && p.contentId === contentId);
  };

  const getContentProgress = (contentId: string) => {
    const studentsWithProgress = students.filter(student => {
      const progress = getStudentProgress(student.id, contentId);
      return progress && progress.percentage > 0;
    });

    const completedStudents = students.filter(student => {
      const progress = getStudentProgress(student.id, contentId);
      return progress && progress.completed;
    });

    return {
      totalStudents: students.length,
      studentsStarted: studentsWithProgress.length,
      studentsCompleted: completedStudents.length,
      averageProgress: studentsWithProgress.length > 0 
        ? studentsWithProgress.reduce((acc, student) => {
            const progress = getStudentProgress(student.id, contentId);
            return acc + (progress?.percentage || 0);
          }, 0) / studentsWithProgress.length
        : 0
    };
  };

  const getStudentVideoDetails = (contentId: string) => {
    return students.map(student => {
      const progress = getStudentProgress(student.id, contentId);
      return {
        student,
        progress: progress?.percentage || 0,
        completed: progress?.completed || false,
        lastAccessed: progress?.lastAccessed || null
      };
    }).sort((a, b) => b.progress - a.progress);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Conteúdos da Trilha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trail.modules.map((module) => (
                <div key={module.id} className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    {module.title}
                  </h4>
                  {module.content.map((content) => {
                    const contentStats = getContentProgress(content.id);
                    const completionRate = (contentStats.studentsCompleted / contentStats.totalStudents) * 100;
                    
                    return (
                      <div 
                        key={content.id}
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedContent?.id === content.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setSelectedContent(content)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-md">
                              {getContentIcon(content.type)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{content.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {content.type === 'video' ? `Vídeo${content.duration ? ` • ${content.duration}` : ''}` : 
                                 content.type === 'pdf' ? 'PDF' : 
                                 content.type === 'quiz' ? 'Quiz' : content.type}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span className="text-xs">{Math.round(completionRate)}%</span>
                            </div>
                            <Progress value={completionRate} className="w-16 h-1" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {selectedContent ? `Detalhes: ${selectedContent.title}` : 'Selecione um conteúdo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedContent ? (
              <div className="space-y-4">
                {/* Content Overview */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                      {getContentIcon(selectedContent.type)}
                    </div>
                    <div>
                      <h3 className="font-medium">{selectedContent.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedContent.description || 'Sem descrição'}
                      </p>
                    </div>
                  </div>
                  
                  {selectedContent.type === 'video' && (
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="outline">Vídeo</Badge>
                      {selectedContent.duration && (
                        <span className="text-muted-foreground">Duração: {selectedContent.duration}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Student Progress List */}
                <div className="space-y-3">
                  <h4 className="font-medium">Progresso dos Alunos</h4>
                  {getStudentVideoDetails(selectedContent.id).map(({ student, progress, completed, lastAccessed }) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {student.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          {lastAccessed && (
                            <p className="text-xs text-muted-foreground">
                              Último acesso: {new Date(lastAccessed).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          {completed ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : progress > 0 ? (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-muted rounded-full" />
                          )}
                          <span className="text-sm font-medium">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <Progress value={progress} className="w-20 h-1" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Statistics Summary */}
                {selectedContent.type === 'video' && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-medium mb-3 text-blue-900 dark:text-blue-100">
                      📊 Estatísticas do Vídeo
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Alunos que iniciaram</p>
                        <p className="font-medium">{getContentProgress(selectedContent.id).studentsStarted}/{students.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Alunos que concluíram</p>
                        <p className="font-medium">{getContentProgress(selectedContent.id).studentsCompleted}/{students.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Progresso médio</p>
                        <p className="font-medium">{Math.round(getContentProgress(selectedContent.id).averageProgress)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Taxa de conclusão</p>
                        <p className="font-medium">
                          {Math.round((getContentProgress(selectedContent.id).studentsCompleted / students.length) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="w-12 h-12 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Selecione um conteúdo</h3>
                <p className="text-sm">Clique em um conteúdo à esquerda para ver o progresso detalhado dos alunos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};