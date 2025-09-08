import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsers } from '@/hooks/useUsers';
import { useEnrollments } from '@/hooks/useEnrollments';
import { ClassWithDetails } from '@/hooks/useClasses';

interface AddStudentDialogProps {
  classroom: ClassWithDetails;
}

export const AddStudentDialog = ({ classroom }: AddStudentDialogProps) => {
  const { users } = useUsers();
  const { createEnrollment, getClassEnrollments } = useEnrollments();
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const classEnrollments = getClassEnrollments(classroom.id);
  const enrolledStudentIds = classEnrollments.map(e => e.student_id);
  
  const availableStudents = users.filter(u => 
    u.roles?.includes('aluno') && 
    !enrolledStudentIds.includes(u.id)
  );

  const handleAddStudent = async () => {
    if (!selectedStudent) return;
    
    try {
      setLoading(true);
      await createEnrollment(classroom.id, selectedStudent);
      setSelectedStudent('');
      setOpen(false);
    } catch (error) {
      console.error('Error adding student:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Adicionar Aluno
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adicionar Aluno à Turma</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Selecionar Aluno</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um aluno" />
              </SelectTrigger>
              <SelectContent>
                {availableStudents.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableStudents.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Todos os alunos já estão matriculados nesta turma.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddStudent}
              disabled={!selectedStudent || loading || availableStudents.length === 0}
            >
              {loading ? 'Adicionando...' : 'Adicionar Aluno'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};