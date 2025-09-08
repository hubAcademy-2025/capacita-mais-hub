import React, { useState } from 'react';
import { Plus, Users, GraduationCap } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { Meeting } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  const [participantTypes, setParticipantTypes] = useState<('students' | 'professors')[]>(['students']);
  
  const { classes, addMeeting, currentUser } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleClassToggle = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleParticipantTypeToggle = (type: 'students' | 'professors') => {
    setParticipantTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || selectedClasses.length === 0 || !dateTime || participantTypes.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Create meetings for each selected class
    const createdMeetings: Meeting[] = [];
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
        hostUserId: currentUser?.id || 'admin-001',
        participantTypes
      };
      
      addMeeting(meeting);
      createdMeetings.push(meeting);
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
    setParticipantTypes(['students']);
    setOpen(false);
  };

  const handleCreateAndStart = () => {
    if (!title.trim() || selectedClasses.length === 0 || !dateTime || participantTypes.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Create the meeting first
    const meeting: Meeting = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      classId: selectedClasses[0], // For now, start with first selected class
      dateTime,
      duration: parseInt(duration),
      description,
      status: 'live',
      meetingUrl: `https://meet.jit.si/capacita-${Math.random().toString(36).substr(2, 8)}`,
      attendanceList: [],
      maxParticipants: 50,
      hostUserId: currentUser?.id || 'admin-001',
      participantTypes
    };
    
    addMeeting(meeting);
    setOpen(false);
    
    // Navigate to meeting room
    navigate(`/admin/meeting/${meeting.id}`);
    
    toast({
      title: "Encontro iniciado!",
      description: "Você está sendo redirecionado para a sala de reunião.",
    });
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
        <form id="meeting-form" onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <Label>Participantes *</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge 
                variant={participantTypes.includes('students') ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleParticipantTypeToggle('students')}
              >
                <Users className="w-3 h-3 mr-1" />
                Alunos
                {participantTypes.includes('students') && ' ✓'}
              </Badge>
              <Badge 
                variant={participantTypes.includes('professors') ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleParticipantTypeToggle('professors')}
              >
                <GraduationCap className="w-3 h-3 mr-1" />
                Professores
                {participantTypes.includes('professors') && ' ✓'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Selecione quem poderá participar do encontro
            </p>
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

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Agendar Encontro{selectedClasses.length > 1 ? 's' : ''}
            </Button>
            <Button 
              type="button" 
              onClick={handleCreateAndStart}
              className="bg-green-600 hover:bg-green-700"
            >
              Criar e Iniciar Agora
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};