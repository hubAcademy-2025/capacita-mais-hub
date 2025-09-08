import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import type { Trail } from '@/types';

interface EditTrailDialogProps {
  trail: Trail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditTrailDialog = ({ trail, open, onOpenChange }: EditTrailDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    level: '' as 'Iniciante' | 'Intermediário' | 'Avançado' | '',
    certificateEnabled: false,
    certificateType: 'trail' as 'trail' | 'module' | 'both',
    isBlocked: false,
  });
  const { updateTrail } = useAppStore();
  const { toast } = useToast();

  useEffect(() => {
    if (trail) {
      setFormData({
        title: trail.title,
        description: trail.description,
        duration: trail.duration,
        level: trail.level,
        certificateEnabled: trail.certificateConfig.enabled,
        certificateType: trail.certificateConfig.type,
        isBlocked: trail.isBlocked || false,
      });
    }
  }, [trail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trail || !formData.title || !formData.description || !formData.duration || !formData.level) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const updatedTrail: Trail = {
      ...trail,
      title: formData.title,
      description: formData.description,
      duration: formData.duration,
      level: formData.level as 'Iniciante' | 'Intermediário' | 'Avançado',
      certificateConfig: {
        enabled: formData.certificateEnabled,
        type: formData.certificateType,
      },
      isBlocked: formData.isBlocked,
    };

    updateTrail(updatedTrail);
    
    toast({
      title: "Sucesso",
      description: "Trilha atualizada com sucesso",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Trilha</DialogTitle>
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
                onValueChange={(value: 'Iniciante' | 'Intermediário' | 'Avançado') => 
                  setFormData(prev => ({ ...prev, level: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Iniciante">Iniciante</SelectItem>
                  <SelectItem value="Intermediário">Intermediário</SelectItem>
                  <SelectItem value="Avançado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="blocked">Status da Trilha</Label>
                <p className="text-sm text-muted-foreground">
                  Bloquear acesso à trilha
                </p>
              </div>
              <Switch
                id="blocked"
                checked={formData.isBlocked}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isBlocked: checked }))
                }
              />
            </div>

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
                  onValueChange={(value: 'trail' | 'module' | 'both') => 
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};