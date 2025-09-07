import { useState } from 'react';
import { Settings, Users, Trash2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/useAppStore';
import { Class } from '@/types';

interface ManageClassDialogProps {
  classroom: Class;
}

export const ManageClassDialog = ({ classroom }: ManageClassDialogProps) => {
  const { users, updateClass, deleteClass } = useAppStore();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: classroom.name,
    status: classroom.status,
  });

  const professor = users.find(u => u.id === classroom.professorId);
  const students = users.filter(u => classroom.studentIds.includes(u.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateClass(classroom.id, formData);
    setOpen(false);
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
      <DialogContent className="sm:max-w-[500px]">
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
            <Label>Professor Responsável</Label>
            <div className="p-2 border rounded-md bg-muted">
              {professor?.name || 'Professor não encontrado'}
            </div>
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

          <div>
            <Label>Alunos ({students.length})</Label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
              {students.length > 0 ? (
                students.map((student) => (
                  <div key={student.id} className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{student.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {student.email}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum aluno matriculado</p>
              )}
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