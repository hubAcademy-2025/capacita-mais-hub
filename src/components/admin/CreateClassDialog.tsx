import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUsers } from '@/hooks/useUsers';
import { useTrails } from '@/hooks/useTrails';
import { useClasses } from '@/hooks/useClasses';

export const CreateClassDialog = () => {
  const { getUsersByRole, loading: usersLoading } = useUsers();
  const { getTrailOptions, loading: trailsLoading } = useTrails();
  const { createClass, loading: classLoading } = useClasses();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    professorId: '',
    trailId: '',
  });

  const professors = getUsersByRole('professor');
  const trails = getTrailOptions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createClass(formData.name, formData.professorId, formData.trailId);
      setOpen(false);
      setFormData({ name: '', description: '', professorId: '', trailId: '' });
    } catch (error) {
      // Error already handled in createClass
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Turma
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Turma</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Turma</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <Label>Professor</Label>
            <Select
              value={formData.professorId}
              onValueChange={(value) => setFormData({ ...formData, professorId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um professor" />
              </SelectTrigger>
              <SelectContent>
                {professors.map((professor) => (
                  <SelectItem key={professor.id} value={professor.id}>
                    {professor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Trilha</Label>
            <Select
              value={formData.trailId}
              onValueChange={(value) => setFormData({ ...formData, trailId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma trilha" />
              </SelectTrigger>
              <SelectContent>
                {trails.map((trail) => (
                  <SelectItem key={trail.id} value={trail.id}>
                    {trail.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={usersLoading || trailsLoading || classLoading}
            >
              {classLoading ? 'Criando...' : 'Criar Turma'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};