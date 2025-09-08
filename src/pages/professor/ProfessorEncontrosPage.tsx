import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Users, Clock, Video, Plus, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreateMeetingDialog } from '@/components/professor/CreateMeetingDialog';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useClasses } from '@/hooks/useClasses';

export const ProfessorEncontrosPage = () => {
  const navigate = useNavigate();
  const { userProfile } = useSupabaseAuth();
  const { classes } = useClasses();

  if (!userProfile) return null;

  // Get professor's classes
  const professorClasses = classes.filter(c => 
    c.professors.some(p => p.id === userProfile.id)
  );
  
  // Placeholder for meetings data (to be implemented with meetings data)
  const allMeetings: any[] = [];
  const upcomingMeetings: any[] = [];
  const pastMeetings: any[] = [];

  const getClassInfo = (classId: string) => {
    const classroom = professorClasses.find(c => c.id === classId);
    return { classroom };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Encontros</h1>
          <p className="text-muted-foreground">Gerencie seus encontros e acompanhe a participação</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/professor/relatorios/frequencia">
              <BarChart className="w-4 h-4 mr-2" />
              Relatórios
            </Link>
          </Button>
          <CreateMeetingDialog>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agendar Encontro
            </Button>
          </CreateMeetingDialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Encontros</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
            <p className="text-xs text-muted-foreground">Encontros agendados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encontros Realizados</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastMeetings.length}</div>
            <p className="text-xs text-muted-foreground">Já concluídos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turmas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{professorClasses.length}</div>
            <p className="text-xs text-muted-foreground">Suas turmas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duração Total</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Minutos de encontros</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Próximos Encontros ({upcomingMeetings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingMeetings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhum encontro agendado</h3>
                <p className="text-sm">Agende um encontro para suas turmas.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Past Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Encontros Realizados ({pastMeetings.length > 10 ? '10+' : pastMeetings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastMeetings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhum encontro realizado</h3>
                <p className="text-sm">Seus encontros anteriores aparecerão aqui.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* No Classes State */}
      {professorClasses.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Nenhuma turma atribuída</h3>
            <p className="text-sm text-muted-foreground">
              Aguarde a atribuição de turmas pelo administrador para poder agendar encontros.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};