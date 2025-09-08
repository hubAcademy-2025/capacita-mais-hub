import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { useTrails } from '@/hooks/useTrails';

interface CreateTrailDialogProps {
  trigger?: React.ReactNode;
}

export const CreateTrailDialog = ({ trigger }: CreateTrailDialogProps) => {
  const { createTrail, loading } = useTrails();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    level: '',
    certificateEnabled: false,
    certificateType: 'trail',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      return;
    }

    try {
      await createTrail({
        title: formData.title,
        description: formData.description || undefined,
        level: formData.level,
        duration: formData.duration || undefined,
        certificate_enabled: formData.certificateEnabled,
        certificate_type: formData.certificateType,
      });

      setFormData({
        title: '',
        description: '',
        duration: '',
        level: '',
        certificateEnabled: false,
        certificateType: 'trail',
      });
      setOpen(false);
    } catch (error) {
      // Error already handled in createTrail
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Trilha
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Trilha</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nome da trilha"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva os objetivos e conteúdo da trilha"
              rows={3}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração *</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="Ex: 40 horas"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level">Nível *</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, level: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="certificate-enabled">Certificado</Label>
                <p className="text-sm text-muted-foreground">
                  Habilitar emissão de certificados
                </p>
              </div>
              <Switch
                id="certificate-enabled"
                checked={formData.certificateEnabled}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, certificateEnabled: checked }))
                }
              />
            </div>

            {formData.certificateEnabled && (
              <div className="space-y-2">
                <Label htmlFor="certificate-type">Tipo de Certificado</Label>
                <Select
                  value={formData.certificateType}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, certificateType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trail">Apenas por trilha completa</SelectItem>
                    <SelectItem value="module">Por módulo concluído</SelectItem>
                    <SelectItem value="both">Trilha e módulos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Trilha'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};