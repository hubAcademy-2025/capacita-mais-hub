import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar, Clock, Users, TrendingUp, ChevronDown, ChevronRight, GraduationCap } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const AdminAttendanceReportsPage = () => {
  const { meetings, classes, users, enrollments } = useAppStore();
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  const toggleClass = (classId: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(classId)) {
      newExpanded.delete(classId);
    } else {
      newExpanded.add(classId);
    }
    setExpandedClasses(newExpanded);
  };

  const toggleStudent = (studentId: string) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  const attendanceStats = useMemo(() => {
    const completedMeetings = meetings.filter(m => m.status === 'completed');
    const totalAttendances = completedMeetings.reduce((acc, meeting) => acc + meeting.attendanceList.length, 0);
    const averageAttendance = completedMeetings.length > 0 ? totalAttendances / completedMeetings.length : 0;
    
    return {
      totalMeetings: completedMeetings.length,
      totalAttendances,
      averageAttendance: Math.round(averageAttendance * 10) / 10
    };
  }, [meetings]);

  const classReports = useMemo(() => {
    return classes.map(classItem => {
      const professor = users.find(u => 
        classItem.professorIds?.includes(u.id) || 
        // @ts-ignore - backward compatibility
        classItem.professorId === u.id
      );
      
      const classMeetings = meetings.filter(m => m.classId === classItem.id && m.status === 'completed');
      const enrolledStudents = enrollments.filter(e => e.classId === classItem.id);
      
      const studentReports = enrolledStudents.map(enrollment => {
        const student = users.find(u => u.id === enrollment.studentId);
        const studentAttendances = classMeetings.map(meeting => {
          const attendance = meeting.attendanceList.find(a => a.userId === enrollment.studentId);
          return {
            meeting,
            attendance,
            attended: !!attendance
          };
        });
        
        const attendedCount = studentAttendances.filter(sa => sa.attended).length;
        const attendanceRate = classMeetings.length > 0 ? (attendedCount / classMeetings.length) * 100 : 0;
        
        return {
          student,
          enrollment,
          attendances: studentAttendances,
          attendedCount,
          totalMeetings: classMeetings.length,
          attendanceRate: Math.round(attendanceRate)
        };
      });

      const totalClassAttendances = classMeetings.reduce((acc, meeting) => acc + meeting.attendanceList.length, 0);
      const classAttendanceRate = enrolledStudents.length > 0 && classMeetings.length > 0 
        ? (totalClassAttendances / (enrolledStudents.length * classMeetings.length)) * 100 
        : 0;

      return {
        classItem,
        professor,
        meetings: classMeetings,
        students: studentReports,
        totalMeetings: classMeetings.length,
        totalStudents: enrolledStudents.length,
        classAttendanceRate: Math.round(classAttendanceRate)
      };
    }).filter(report => report.totalMeetings > 0); // Only show classes with completed meetings
  }, [classes, users, meetings, enrollments]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios de Encontros por Turma</h1>
        <p className="text-muted-foreground">Acompanhe a participação organizando por turma e depois por aluno</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encontros Realizados</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.totalMeetings}</div>
            <p className="text-xs text-muted-foreground">Total de encontros concluídos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turmas Ativas</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classReports.length}</div>
            <p className="text-xs text-muted-foreground">Com encontros realizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Participações</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.totalAttendances}</div>
            <p className="text-xs text-muted-foreground">Soma de todas as presenças</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participação Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.averageAttendance}</div>
            <p className="text-xs text-muted-foreground">Participantes por encontro</p>
          </CardContent>
        </Card>
      </div>

      {/* Classes Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios por Turma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {classReports.map((classReport) => (
              <div key={classReport.classItem.id} className="border rounded-lg">
                <Collapsible 
                  open={expandedClasses.has(classReport.classItem.id)}
                  onOpenChange={() => toggleClass(classReport.classItem.id)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50">
                      <div className="flex items-center gap-3">
                        {expandedClasses.has(classReport.classItem.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">{classReport.classItem.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Professor: {classReport.professor?.name} • {classReport.totalStudents} alunos • {classReport.totalMeetings} encontros
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={classReport.classAttendanceRate >= 70 ? 'default' : classReport.classAttendanceRate >= 50 ? 'secondary' : 'destructive'}>
                          {classReport.classAttendanceRate}% participação geral
                        </Badge>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-4 pb-4">
                      <div className="space-y-3">
                        {classReport.students.map((studentReport) => (
                          <div key={studentReport.student?.id} className="border rounded-lg">
                            <Collapsible
                              open={expandedStudents.has(studentReport.student?.id || '')}
                              onOpenChange={() => toggleStudent(studentReport.student?.id || '')}
                            >
                              <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-secondary/30">
                                  <div className="flex items-center gap-3">
                                    {expandedStudents.has(studentReport.student?.id || '') ? (
                                      <ChevronDown className="w-3 h-3" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3" />
                                    )}
                                    <Avatar className="w-8 h-8">
                                      <AvatarFallback>
                                        {studentReport.student?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{studentReport.student?.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {studentReport.attendedCount} de {studentReport.totalMeetings} encontros
                                      </p>
                                    </div>
                                  </div>
                                  <Badge variant={studentReport.attendanceRate >= 70 ? 'default' : studentReport.attendanceRate >= 50 ? 'secondary' : 'destructive'}>
                                    {studentReport.attendanceRate}%
                                  </Badge>
                                </div>
                              </CollapsibleTrigger>
                              
                              <CollapsibleContent>
                                <div className="px-6 pb-3">
                                  <div className="space-y-2">
                                    {studentReport.attendances.map((attendanceRecord) => (
                                      <div key={attendanceRecord.meeting.id} className={`flex items-center justify-between p-2 rounded ${attendanceRecord.attended ? 'bg-green-50' : 'bg-red-50'}`}>
                                        <div>
                                          <p className="text-sm font-medium">{attendanceRecord.meeting.title}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {format(new Date(attendanceRecord.meeting.dateTime), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <Badge variant={attendanceRecord.attended ? 'default' : 'secondary'}>
                                            {attendanceRecord.attended ? 'Presente' : 'Ausente'}
                                          </Badge>
                                          {attendanceRecord.attendance && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                              {attendanceRecord.attendance.duration ? `${attendanceRecord.attendance.duration} min` : 'Em andamento'}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        ))}
                        
                        {classReport.students.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">
                            Nenhum aluno matriculado nesta turma
                          </p>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
            
            {classReports.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhum encontro concluído</h3>
                <p className="text-sm">Os relatórios de encontros aparecerão aqui após serem realizados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};