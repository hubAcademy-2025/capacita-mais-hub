import { useState } from 'react';
import { Users, Plus, UserCheck, GraduationCap, Building, Edit, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatsCard } from '@/components/ui/stats-card';
import { useAppStore } from '@/store/useAppStore';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import { EditUserDialog } from '@/components/admin/EditUserDialog';
import { ManageUserDialog } from '@/components/admin/ManageUserDialog';
import { useUsers, type UserWithRoles } from '@/hooks/useUsers';
import type { User } from '@/types';

export const AdminUsuariosPage = () => {
  const { classes, enrollments } = useAppStore();
  const { users, loading, error, getUsersByRole, getUserStats } = useUsers();
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [manageUser, setManageUser] = useState<UserWithRoles | null>(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);

  const { admins, professors, students, total } = getUserStats();

  // Convert UserWithRoles to User for compatibility with existing dialogs
  const convertToUser = (userWithRoles: UserWithRoles): User => ({
    id: userWithRoles.id,
    name: userWithRoles.name,
    email: userWithRoles.email,
    role: userWithRoles.roles[0] as any, // Use primary role
    avatar: userWithRoles.avatar_url
  });

  const getUserClassInfo = (user: UserWithRoles) => {
    if (user.roles.includes('professor')) {
      const professorClasses = classes.filter(c => 
        c.professorIds?.includes(user.id) || 
        // @ts-ignore - backward compatibility
        c.professorId === user.id
      );
      return `${professorClasses.length} turmas`;
    } else if (user.roles.includes('aluno')) {
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando usuários...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-destructive">
          <p>Erro ao carregar usuários: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Gerencie todos os usuários da plataforma</p>
        </div>
        <CreateUserDialog />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Usuários"
          value={total}
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
              {getUsersByRole('admin').map((user) => (
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setEditingUser(user);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
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
              {getUsersByRole('professor').map((user) => (
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setEditingUser(user);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
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
              {getUsersByRole('aluno').map((user) => (
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setEditingUser(user);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
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
                  <div className="flex gap-1">
                    {user.roles.map((role, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {getRoleIcon(role)}
                        {getRoleName(role)}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setManageUser(user);
                      setManageDialogOpen(true);
                    }}
                  >
                    Gerenciar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EditUserDialog 
        user={editingUser ? convertToUser(editingUser) : null}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
      
      <ManageUserDialog 
        user={manageUser ? convertToUser(manageUser) : null}
        open={manageDialogOpen}
        onOpenChange={setManageDialogOpen}
        onEdit={(user) => {
          // Find the original UserWithRoles object
          const originalUser = users.find(u => u.id === user.id);
          if (originalUser) {
            setEditingUser(originalUser);
            setEditDialogOpen(true);
          }
        }}
      />
    </div>
  );
};