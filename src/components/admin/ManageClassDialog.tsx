import { useState } from 'react';
import { Settings, Users, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsers } from '@/hooks/useUsers';
import { useTrails } from '@/hooks/useTrails';
import { useEnrollments } from '@/hooks/useEnrollments';
import { ClassWithDetails } from '@/hooks/useClasses';

interface ManageClassDialogProps {
  classroom: ClassWithDetails;
}

export const ManageClassDialog = ({ classroom }: ManageClassDialogProps) => {
  const { users } = useUsers();
  const { trails } = useTrails();
  const { 
    enrollments, 
    createEnrollment, 
    deleteEnrollment, 
    getClassEnrollments 
  } = useEnrollments();
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: classroom.name,
    status: classroom.status,
  });

  // Get current class data
  const classEnrollments = getClassEnrollments(classroom.id);
  const enrolledStudents = classEnrollments.map(e => e.student);
  const availableStudents = users.filter(u => 
    u.roles?.includes('aluno') && 
    !classEnrollments.some(e => e.student_id === u.id)
  );
  const availableProfessors = users.filter(u => u.roles?.includes('professor'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just close the dialog - full update functionality to be implemented
    setOpen(false);
  };

  const addStudent = async (studentId: string) => {
    try {
      await createEnrollment(classroom.id, studentId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const removeStudent = async (enrollmentId: string) => {
    try {
      await deleteEnrollment(enrollmentId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta turma?')) {
      // For now, just close the dialog - delete functionality to be implemented
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-1" />
          Gerenciar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Turma - {classroom.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Turma</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label>Status</Label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'completed' | 'paused' })}
              className="w-full p-2 border rounded-md"
            >
              <option value="active">Ativa</option>
              <option value="completed">Completa</option>
              <option value="paused">Pausada</option>
            </select>
          </div>

          {/* Current Professors */}
          <div>
            <Label>Professores Responsáveis</Label>
            <div className="space-y-2">
              {classroom.professors.map((professor) => (
                <div key={professor.id} className="flex items-center gap-2 p-2 border rounded-md">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{professor.name}</span>
                  <Badge variant="outline" className="text-xs">{professor.email}</Badge>
                </div>
              ))}
              {classroom.professors.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum professor atribuído</p>
              )}
            </div>
          </div>

          {/* Current Trails */}
          <div>
            <Label>Trilhas da Turma</Label>
            <div className="space-y-2">
              {classroom.trails.map((trail) => (
                <div key={trail.id} className="flex items-center gap-2 p-2 border rounded-md">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{trail.title}</span>
                </div>
              ))}
              {classroom.trails.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma trilha atribuída</p>
              )}
            </div>
          </div>

          <div>
            <Label>Alunos ({enrolledStudents.length})</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Select onValueChange={addStudent}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Adicionar aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                {enrolledStudents.length > 0 ? (
                  enrolledStudents.map((student) => {
                    const enrollment = classEnrollments.find(e => e.student_id === student.id);
                    return (
                      <div key={student.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{student.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {student.email}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => enrollment && removeStudent(enrollment.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum aluno matriculado</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Excluir Turma
            </Button>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Alterações
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};