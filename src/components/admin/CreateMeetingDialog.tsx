import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/store/useAppStore';
import { Meeting } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CreateMeetingDialogProps {
  children: React.ReactNode;
}

export const CreateMeetingDialog = ({ children }: CreateMeetingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [dateTime, setDateTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [description, setDescription] = useState('');
  
  const { classes, addMeeting } = useAppStore();
  const { toast } = useToast();

  const handleClassToggle = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || selectedClasses.length === 0 || !dateTime) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Create meetings for each selected class
    selectedClasses.forEach(classId => {
      const meeting: Meeting = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        classId,
        dateTime,
        duration: parseInt(duration),
        description,
        status: 'scheduled',
        meetingUrl: `https://meet.jit.si/capacita-${Math.random().toString(36).substr(2, 8)}`,
        attendanceList: [],
        maxParticipants: 50,
        hostUserId: 'admin-001' // Admin as host
      };
      
      addMeeting(meeting);
    });

    toast({
      title: "Encontros criados!",
      description: `${selectedClasses.length} encontro(s) agendado(s) com sucesso.`,
    });

    // Reset form
    setTitle('');
    setSelectedClasses([]);
    setDateTime('');
    setDuration('60');
    setDescription('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Agendar Encontro</DialogTitle>
          <DialogDescription>
            Crie um encontro para uma ou várias turmas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título do Encontro *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Aula de React Hooks"
              required
            />
          </div>

          <div>
            <Label>Turmas Selecionadas *</Label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-3 mt-2">
              {classes.map((classItem) => (
                <div key={classItem.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={classItem.id}
                    checked={selectedClasses.includes(classItem.id)}
                    onCheckedChange={() => handleClassToggle(classItem.id)}
                  />
                  <Label 
                    htmlFor={classItem.id} 
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {classItem.name} ({classItem.studentIds.length} alunos)
                  </Label>
                </div>
              ))}
            </div>
            {selectedClasses.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedClasses.length} turma(s) selecionada(s)
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateTime">Data e Hora *</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a duração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1h 30min</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo do encontro..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Agendar Encontro{selectedClasses.length > 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};