import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Mail, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types';

interface CreateUserDialogProps {
  trigger?: React.ReactNode;
}

export const CreateUserDialog = ({ trigger }: CreateUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendInvite, setSendInvite] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '' as UserRole,
  });
  const { addUser, currentUser } = useAppStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const newUser = {
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      // Add user to local state
      addUser(newUser);

      // Send invite email if requested
      if (sendInvite) {
        console.log('Sending invite email...');
        const { data, error } = await supabase.functions.invoke('send-invite-email', {
          body: {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            invitedBy: currentUser?.name || 'Administrador'
          }
        });

        if (error) {
          console.error('Error sending invite email:', error);
          toast({
            title: "Usuário criado com avisos",
            description: "Usuário criado, mas não foi possível enviar o email de convite. Tente reenviar manualmente.",
            variant: "destructive"
          });
        } else {
          console.log('Invite email sent successfully:', data);
          toast({
            title: "Sucesso",
            description: `Usuário criado e convite enviado para ${formData.email}`,
          });
        }
      } else {
        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso",
        });
      }

      setFormData({ name: '', email: '', role: '' as UserRole });
      setSendInvite(true);
      setOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar usuário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome completo do usuário"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Papel *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o papel do usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="professor">Professor</SelectItem>
                <SelectItem value="aluno">Aluno</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="send-invite" 
                checked={sendInvite} 
                onCheckedChange={(checked) => setSendInvite(checked === true)}
              />
              <Label htmlFor="send-invite" className="text-sm">
                Enviar convite por email
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              {sendInvite ? 
                '✉️ Um email de convite será enviado com as instruções para criar a conta' : 
                'O usuário precisará criar a conta manualmente'
              }
            </p>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {sendInvite ? (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Criar e Enviar Convite
                </>
              ) : (
                'Criar Usuário'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};