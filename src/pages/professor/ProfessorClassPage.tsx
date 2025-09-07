import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  BarChart3, 
  Calendar, 
  MessageCircle, 
  BookOpen,
  Plus,
  Edit,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { CommunityTab } from '@/components/aluno/CommunityTab';
import { Meeting } from '@/types';

export const ProfessorClassPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const { 
    classes, 
    trails, 
    currentUser, 
    enrollments, 
    users, 
    meetings,
    userProgress,
    addMeeting,
    updateEnrollment
  } = useAppStore();
  
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newMeetingTime, setNewMeetingTime] = useState('');
  const [newMeetingDuration, setNewMeetingDuration] = useState('90');
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);

  const classroom = classes.find(c => c.id === classId);
  const classEnrollments = enrollments.filter(e => e.classId === classId);
  const classMeetings = meetings.filter(m => m.classId === classId);
  const trail = classroom ? trails.find(t => t.id === classroom.trailId) : null;

  if (!classroom || classroom.professorId !== currentUser?.id) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Turma não encontrada</h2>
            <p className="text-muted-foreground">
              Você não tem acesso a esta turma ou ela não existe.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const students = users.filter(u => classroom.studentIds.includes(u.id));

  const handleCreateMeeting = () => {
    if (!newMeetingTitle || !newMeetingDate || !newMeetingTime) return;

    const meeting: Meeting = {
      id: Date.now().toString(),
      classId: classroom.id,
      title: newMeetingTitle,
      dateTime: `${newMeetingDate}T${newMeetingTime}:00`,
      duration: parseInt(newMeetingDuration),
      status: 'scheduled'
    };

    addMeeting(meeting);
    setNewMeetingTitle('');
    setNewMeetingDate('');
    setNewMeetingTime('');
    setNewMeetingDuration('90');
    setShowNewMeetingForm(false);
  };

  const handleUpdateGrade = (studentId: string, grade: number) => {
    updateEnrollment(studentId, classroom.id, { finalGrade: grade });
  };

  const getStudentProgress = (studentId: string, contentId: string) => {
    return userProgress.find(p => p.userId === studentId && p.contentId === contentId);
  };

  const calculateStudentOverallProgress = (studentId: string) => {
    if (!trail) return 0;
    const allContent = trail.modules.flatMap(m => m.content);
    const completedContent = allContent.filter(c => {
      const progress = getStudentProgress(studentId, c.id);
      return progress?.completed;
    }).length;
    return allContent.length > 0 ? (completedContent / allContent.length) * 100 : 0;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Class Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{classroom.name}</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant={classroom.status === 'active' ? 'default' : 'secondary'}>
                  {classroom.status === 'active' ? 'Ativa' : 'Inativa'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {students.length} alunos
                </span>
                {trail && (
                  <span className="text-sm text-muted-foreground">
                    Trilha: {trail.title}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="alunos" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="alunos" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Alunos
          </TabsTrigger>
          <TabsTrigger value="acompanhamento" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Acompanhamento
          </TabsTrigger>
          <TabsTrigger value="comunidade" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Comunidade
          </TabsTrigger>
          <TabsTrigger value="encontros" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Encontros
          </TabsTrigger>
          <TabsTrigger value="trilhas" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Trilhas
          </TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="alunos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Alunos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => {
                  const enrollment = classEnrollments.find(e => e.studentId === student.id);
                  const progress = calculateStudentOverallProgress(student.id);
                  
                  return (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{Math.round(progress)}% concluído</p>
                          <Progress value={progress} className="w-24 mt-1" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Nota:</span>
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={enrollment?.finalGrade || ''}
                            onChange={(e) => handleUpdateGrade(student.id, parseFloat(e.target.value))}
                            className="w-20"
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tracking Tab */}
        <TabsContent value="acompanhamento" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              {trail && (
                <div className="space-y-6">
                  {trail.modules.map((module) => (
                    <div key={module.id} className="space-y-3">
                      <h3 className="font-semibold">{module.title}</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="border p-2 text-left">Aluno</th>
                              {module.content.map((content) => (
                                <th key={content.id} className="border p-2 text-center min-w-24">
                                  {content.title}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {students.map((student) => (
                              <tr key={student.id}>
                                <td className="border p-2 font-medium">{student.name}</td>
                                {module.content.map((content) => {
                                  const progress = getStudentProgress(student.id, content.id);
                                  return (
                                    <td key={content.id} className="border p-2 text-center">
                                      {progress?.completed ? (
                                        <CheckCircle className="w-5 h-5 text-success mx-auto" />
                                      ) : progress?.percentage > 0 ? (
                                        <Clock className="w-5 h-5 text-warning mx-auto" />
                                      ) : (
                                        <div className="w-5 h-5 border-2 border-muted rounded-full mx-auto" />
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="comunidade" className="mt-6">
          <CommunityTab classId={classroom.id} />
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="encontros" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Encontros Agendados</CardTitle>
                  <Button onClick={() => setShowNewMeetingForm(!showNewMeetingForm)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agendar Encontro
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showNewMeetingForm && (
                  <div className="space-y-4 p-4 border rounded-lg mb-6">
                    <h3 className="font-semibold">Novo Encontro</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Input
                          placeholder="Título do encontro"
                          value={newMeetingTitle}
                          onChange={(e) => setNewMeetingTitle(e.target.value)}
                        />
                      </div>
                      <Input
                        type="date"
                        value={newMeetingDate}
                        onChange={(e) => setNewMeetingDate(e.target.value)}
                      />
                      <Input
                        type="time"
                        value={newMeetingTime}
                        onChange={(e) => setNewMeetingTime(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Duração (minutos)"
                        value={newMeetingDuration}
                        onChange={(e) => setNewMeetingDuration(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateMeeting}>Criar Encontro</Button>
                      <Button variant="outline" onClick={() => setShowNewMeetingForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {classMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{meeting.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(meeting.dateTime).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(meeting.dateTime).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Duração: {meeting.duration} minutos
                        </p>
                      </div>
                      <Badge variant={meeting.status === 'scheduled' ? 'default' : 'secondary'}>
                        {meeting.status === 'scheduled' ? 'Agendado' : 'Concluído'}
                      </Badge>
                    </div>
                  ))}
                  
                  {classMeetings.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4" />
                      <h3 className="font-medium mb-2">Nenhum encontro agendado</h3>
                      <p className="text-sm">Agende o primeiro encontro para sua turma!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trails Tab */}
        <TabsContent value="trilhas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Trilha da Turma</CardTitle>
            </CardHeader>
            <CardContent>
              {trail ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{trail.title}</h3>
                      <p className="text-muted-foreground mt-1">{trail.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline">{trail.level}</Badge>
                        <span className="text-sm text-muted-foreground">{trail.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Módulos ({trail.modules.length})</h4>
                    {trail.modules.map((module) => (
                      <div key={module.id} className="p-3 border rounded-lg">
                        <h5 className="font-medium">{module.title}</h5>
                        <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {module.content.length} conteúdos
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Nenhuma trilha associada</h3>
                  <p className="text-sm">Esta turma ainda não possui uma trilha de aprendizado.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};