import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, Users, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const AdminAttendanceReportsPage = () => {
  const { meetings, classes, users, enrollments } = useAppStore();

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

  const meetingReports = useMemo(() => {
    return meetings
      .filter(m => m.status === 'completed')
      .map(meeting => {
        const classInfo = classes.find(c => c.id === meeting.classId);
        const professor = users.find(u => 
          classInfo?.professorIds?.includes(u.id) || 
          // @ts-ignore - backward compatibility
          classInfo?.professorId === u.id
        );
        
        const enrolledStudents = enrollments.filter(e => e.classId === meeting.classId);
        const attendanceRate = enrolledStudents.length > 0 
          ? (meeting.attendanceList.length / enrolledStudents.length) * 100 
          : 0;

        return {
          ...meeting,
          classInfo,
          professor,
          enrolledCount: enrolledStudents.length,
          attendanceRate: Math.round(attendanceRate),
          attendees: meeting.attendanceList.map(attendance => {
            const user = users.find(u => u.id === attendance.userId);
            return {
              ...attendance,
              user
            };
          })
        };
      })
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }, [meetings, classes, users, enrollments]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios de Encontros</h1>
        <p className="text-muted-foreground">Acompanhe a participação nos encontros de todas as turmas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Meeting Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes dos Encontros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {meetingReports.map((meeting) => (
              <div key={meeting.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{meeting.title}</h3>
                    <p className="text-sm text-muted-foreground">{meeting.classInfo?.name}</p>
                    <p className="text-sm text-muted-foreground">Professor: {meeting.professor?.name}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(meeting.dateTime), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {meeting.duration} min
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={meeting.attendanceRate >= 70 ? 'default' : meeting.attendanceRate >= 50 ? 'secondary' : 'destructive'}>
                      {meeting.attendanceRate}% presença
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {meeting.attendanceList.length} de {meeting.enrolledCount} alunos
                    </p>
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <h4 className="font-medium mb-3">Participantes ({meeting.attendanceList.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {meeting.attendees.map((attendee) => (
                      <div key={attendee.userId} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {attendee.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{attendee.user?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Entrou: {format(new Date(attendee.checkInTime), 'HH:mm')}
                          </p>
                          {attendee.duration && (
                            <p className="text-xs text-muted-foreground">
                              Duração: {attendee.duration} min
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          {attendee.status === 'present' ? 'Presente' : attendee.status === 'late' ? 'Atrasado' : 'Ausente'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  {meeting.attendanceList.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum participante registrado
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {meetingReports.length === 0 && (
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