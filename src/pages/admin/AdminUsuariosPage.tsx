import { Users, Plus, UserCheck, GraduationCap, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatsCard } from '@/components/ui/stats-card';
import { useAppStore } from '@/store/useAppStore';

export const AdminUsuariosPage = () => {
  const { users, classes, enrollments } = useAppStore();

  const getUserStats = () => {
    const admins = users.filter(u => u.role === 'admin').length;
    const professors = users.filter(u => u.role === 'professor').length;
    const students = users.filter(u => u.role === 'aluno').length;
    
    return { admins, professors, students };
  };

  const { admins, professors, students } = getUserStats();

  const getUserClassInfo = (user: any) => {
    if (user.role === 'professor') {
      const professorClasses = classes.filter(c => c.professorId === user.id);
      return `${professorClasses.length} turmas`;
    } else if (user.role === 'aluno') {
      const studentEnrollments = enrollments.filter(e => e.studentId === user.id);
      return `${studentEnrollments.length} matrículas`;
    }
    return 'Administrador';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Building className="w-4 h-4" />;
      case 'professor':
        return <UserCheck className="w-4 h-4" />;
      case 'aluno':
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'professor':
        return 'Professor';
      case 'aluno':
        return 'Aluno';
      default:
        return role;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Gerencie todos os usuários da plataforma</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Usuários"
          value={users.length}
          icon={Users}
        />
        <StatsCard
          title="Administradores"
          value={admins}
          icon={Building}
        />
        <StatsCard
          title="Professores"
          value={professors}
          icon={UserCheck}
        />
        <StatsCard
          title="Alunos"
          value={students}
          icon={GraduationCap}
        />
      </div>

      {/* Users by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Administrators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Administradores ({admins})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.filter(u => u.role === 'admin').map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Professors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Professores ({professors})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.filter(u => u.role === 'professor').map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{getUserClassInfo(user)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Alunos ({students})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.filter(u => u.role === 'aluno').map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{getUserClassInfo(user)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{getUserClassInfo(user)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getRoleIcon(user.role)}
                    {getRoleName(user.role)}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Gerenciar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};