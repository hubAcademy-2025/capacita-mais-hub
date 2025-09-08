import { useState } from 'react';
import { Settings, Users, Trash2, Plus, X } from 'lucide-react';
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
import { useAppStore } from '@/store/useAppStore';
import { Class } from '@/types';

interface ManageClassDialogProps {
  classroom: Class;
}

export const ManageClassDialog = ({ classroom }: ManageClassDialogProps) => {
  const { users, trails, updateClass, deleteClass, enrollments } = useAppStore();
  const [open, setOpen] = useState(false);
  
  // Handle both old and new data structure
  const professorIds = classroom.professorIds || 
    // @ts-ignore - backward compatibility
    [classroom.professorId].filter(Boolean);
  const trailIds = classroom.trailIds || 
    // @ts-ignore - backward compatibility
    [classroom.trailId].filter(Boolean);
  
  const [formData, setFormData] = useState({
    name: classroom.name,
    status: classroom.status,
    professorIds: professorIds,
    trailIds: trailIds,
  });

  const professors = users.filter(u => formData.professorIds.includes(u.id));
  const students = users.filter(u => classroom.studentIds.includes(u.id));
  const availableProfessors = users.filter(u => u.role === 'professor');
  const availableStudents = users.filter(u => u.role === 'aluno' && !classroom.studentIds.includes(u.id));
  const classTrails = trails.filter(t => formData.trailIds.includes(t.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateClass(classroom.id, {
      ...formData,
      professorIds: formData.professorIds,
      trailIds: formData.trailIds,
    });
    setOpen(false);
  };

  const addProfessor = (professorId: string) => {
    if (!formData.professorIds.includes(professorId)) {
      setFormData({
        ...formData,
        professorIds: [...formData.professorIds, professorId]
      });
    }
  };

  const removeProfessor = (professorId: string) => {
    setFormData({
      ...formData,
      professorIds: formData.professorIds.filter(id => id !== professorId)
    });
  };

  const addTrail = (trailId: string) => {
    if (!formData.trailIds.includes(trailId)) {
      setFormData({
        ...formData,
        trailIds: [...formData.trailIds, trailId]
      });
    }
  };

  const removeTrail = (trailId: string) => {
    setFormData({
      ...formData,
      trailIds: formData.trailIds.filter(id => id !== trailId)
    });
  };

  const addStudent = (studentId: string) => {
    if (!classroom.studentIds.includes(studentId)) {
      const updatedStudentIds = [...classroom.studentIds, studentId];
      updateClass(classroom.id, { studentIds: updatedStudentIds });
      
      // Create enrollment if it doesn't exist
      const existingEnrollment = enrollments.find(e => 
        e.studentId === studentId && e.classId === classroom.id
      );
      
      if (!existingEnrollment) {
        // Add enrollment to store - we'll need to add this function to the store
        const newEnrollment = {
          studentId,
          classId: classroom.id,
          progress: 0,
          completedContent: [],
          enrolledAt: new Date().toISOString()
        };
        // For now, we'll update the enrollments directly through the store
        useAppStore.setState(state => ({
          enrollments: [...state.enrollments, newEnrollment]
        }));
      }
    }
  };

  const removeStudent = (studentId: string) => {
    const updatedStudentIds = classroom.studentIds.filter(id => id !== studentId);
    updateClass(classroom.id, { studentIds: updatedStudentIds });
    
    // Remove enrollment
    useAppStore.setState(state => ({
      enrollments: state.enrollments.filter(e => 
        !(e.studentId === studentId && e.classId === classroom.id)
      )
    }));
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta turma?')) {
      deleteClass(classroom.id);
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

          {/* Multiple Professors */}
          <div>
            <Label>Professores Responsáveis</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Select onValueChange={addProfessor}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Adicionar professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProfessors
                      .filter(p => !formData.professorIds.includes(p.id))
                      .map((professor) => (
                        <SelectItem key={professor.id} value={professor.id}>
                          {professor.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {professors.map((professor) => (
                  <div key={professor.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{professor.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProfessor(professor.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {professors.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum professor atribuído</p>
                )}
              </div>
            </div>
          </div>

          {/* Multiple Trails */}
          <div>
            <Label>Trilhas da Turma</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Select onValueChange={addTrail}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Adicionar trilha" />
                  </SelectTrigger>
                  <SelectContent>
                    {trails
                      .filter(t => !formData.trailIds.includes(t.id))
                      .map((trail) => (
                        <SelectItem key={trail.id} value={trail.id}>
                          {trail.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {classTrails.map((trail) => (
                  <div key={trail.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{trail.title}</span>
                      <Badge variant="outline" className="text-xs">{trail.level}</Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTrail(trail.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {classTrails.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma trilha atribuída</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label>Alunos ({students.length})</Label>
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
                {students.length > 0 ? (
                  students.map((student) => (
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
                        onClick={() => removeStudent(student.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
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