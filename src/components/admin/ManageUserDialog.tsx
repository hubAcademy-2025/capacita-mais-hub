import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Edit, Trash2, UserCheck, GraduationCap, Building } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types';

interface ManageUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (user: User) => void;
}

export const ManageUserDialog = ({ user, open, onOpenChange, onEdit }: ManageUserDialogProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteUser, classes, enrollments } = useAppStore();
  const { toast } = useToast();

  if (!user) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Building className="w-4 h-4" />;
      case 'professor':
        return <UserCheck className="w-4 h-4" />;
      case 'aluno':
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <UserCheck className="w-4 h-4" />;
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

  const getUserStats = () => {
    if (user.role === 'professor') {
      const professorClasses = classes.filter(c => 
        c.professorIds?.includes(user.id) || 
        // @ts-ignore - backward compatibility
        c.professorId === user.id
      );
      return `${professorClasses.length} turmas atribuídas`;
    } else if (user.role === 'aluno') {
      const studentEnrollments = enrollments.filter(e => e.studentId === user.id);
      return `${studentEnrollments.length} matrículas ativas`;
    }
    return 'Acesso administrativo total';
  };

  const handleDelete = () => {
    deleteUser(user.id);
    toast({
      title: "Usuário removido",
      description: "O usuário foi removido com sucesso",
    });
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  const handleEdit = () => {
    onEdit(user);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Usuário</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                <Badge variant="outline" className="flex items-center gap-1 w-fit mt-1">
                  {getRoleIcon(user.role)}
                  {getRoleName(user.role)}
                </Badge>
              </div>
            </div>

            {/* User Stats */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Informações Adicionais</h4>
              <p className="text-sm text-muted-foreground">{getUserStats()}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleEdit} className="flex-1">
                <Edit className="w-4 h-4 mr-2" />
                Editar Usuário
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remover Usuário
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o usuário "{user.name}"? 
              Esta ação não pode ser desfeita e todos os dados associados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};