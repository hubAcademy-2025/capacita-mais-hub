import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/useAppStore';
import { Meeting } from '@/types';

interface CreateMeetingDialogProps {
  children: React.ReactNode;
}

export const CreateMeetingDialog = ({ children }: CreateMeetingDialogProps) => {
  const { currentUser, classes, addMeeting } = useAppStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('90');
  const [description, setDescription] = useState('');

  if (!currentUser) return null;

  const professorClasses = classes.filter(c => 
    (c.professorIds && c.professorIds.includes(currentUser.id)) || 
    // @ts-ignore - backward compatibility
    c.professorId === currentUser.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !selectedClassId || !date || !time) return;

    const meeting: Meeting = {
      id: Date.now().toString(),
      classId: selectedClassId,
      title,
      dateTime: `${date}T${time}:00`,
      duration: parseInt(duration),
      description,
      status: 'scheduled',
      hostUserId: currentUser.id,
      attendanceList: [],
      participantTypes: ['students']
    };

    addMeeting(meeting);
    
    // Reset form
    setTitle('');
    setSelectedClassId('');
    setDate('');
    setTime('');
    setDuration('90');
    setDescription('');
    setOpen(false);
  };

  const isFormValid = title && selectedClassId && date && time;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Agendar Novo Encontro
          </DialogTitle>
          <DialogDescription>
            Agende um encontro online para uma de suas turmas
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Encontro *</Label>
            <Input
              id="title"
              placeholder="Ex: Aula Prática - React Hooks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Turma *</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma turma" />
              </SelectTrigger>
              <SelectContent>
                {professorClasses.map((classroom) => (
                  <SelectItem key={classroom.id} value={classroom.id}>
                    {classroom.name} ({classroom.studentIds.length} alunos)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toLocaleDateString('en-CA')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duração (minutos)</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="90">1h 30min</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
                <SelectItem value="180">3 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descreva o que será abordado no encontro..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Encontro
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};