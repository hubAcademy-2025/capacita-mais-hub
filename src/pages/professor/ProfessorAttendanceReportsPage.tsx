import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, TrendingUp, GraduationCap } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useClasses } from '@/hooks/useClasses';

export const ProfessorAttendanceReportsPage = () => {
  const { userProfile } = useSupabaseAuth();
  const { classes } = useClasses();

  if (!userProfile) return null;

  // Get professor's classes (including admin as they can see all classes)
  const professorClasses = userProfile.roles.includes('admin') 
    ? classes  // Admin can see all classes
    : classes.filter(c => c.professors.some(p => p.id === userProfile.id));

  // Placeholder data since meetings are not implemented yet
  const attendanceStats = {
    totalMeetings: 0,
    totalAttendances: 0,
    averageAttendance: 0
  };

  const classReports: any[] = [];


  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios das Minhas Turmas</h1>
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
            <p className="text-xs text-muted-foreground">Das suas turmas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minhas Turmas</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{professorClasses.length}</div>
            <p className="text-xs text-muted-foreground">Turmas atribuídas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Participações</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.totalAttendances}</div>
            <p className="text-xs text-muted-foreground">Alunos que participaram</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participação Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.averageAttendance}</div>
            <p className="text-xs text-muted-foreground">Alunos por encontro</p>
          </CardContent>
        </Card>
      </div>

      {/* Classes Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Turmas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {professorClasses.map((classItem) => (
              <div key={classItem.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{classItem.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {classItem.student_count} alunos • {classItem.trails.length} trilhas
                    </p>
                  </div>
                  <Badge variant="secondary">
                    Relatórios em breve
                  </Badge>
                </div>
              </div>
            ))}
            
            {professorClasses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhuma turma atribuída</h3>
                <p className="text-sm">Aguarde a atribuição de turmas pelo administrador.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};