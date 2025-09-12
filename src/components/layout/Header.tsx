import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, ChevronDown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { NotificationPanel } from './NotificationPanel';

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  const { currentUser, currentRole, notifications, sidebarCollapsed } = useAppStore();
  const { signOut } = useAuth();
  const { userProfile, switchRole } = useSupabaseAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  
  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleRoleChange = (role: 'admin' | 'professor' | 'aluno') => {
    switchRole(role);
    // Navigate to appropriate dashboard
    const basePath = role === 'admin' ? '/admin' : role === 'professor' ? '/professor' : '/aluno';
    navigate(basePath);
  };

  // Only show roles that the user actually has
  const availableRoles = userProfile?.roles || [];

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'professor':
        return 'Professor';
      case 'aluno':
        return 'Aluno';
      default:
        return role;
    }
  };

  return (
    <header className={`bg-card border-b border-border px-6 py-4 relative z-10 transition-all duration-300 ${
      sidebarCollapsed ? 'ml-16' : 'ml-64'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {/* <p className="text-sm text-muted-foreground">
            Bem-vindo, {currentUser?.name}
          </p> */}
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 min-w-5 text-xs p-0 flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
            
            <NotificationPanel
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>

          {/* Role Switcher - Only show if user has multiple roles */}
          {availableRoles.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {getRoleName(currentRole)}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {availableRoles.includes('admin') && (
                  <DropdownMenuItem onClick={() => handleRoleChange('admin')}>
                    <User className="w-4 h-4 mr-2" />
                    Administrador
                  </DropdownMenuItem>
                )}
                {availableRoles.includes('professor') && (
                  <DropdownMenuItem onClick={() => handleRoleChange('professor')}>
                    <User className="w-4 h-4 mr-2" />
                    Professor
                  </DropdownMenuItem>
                )}
                {availableRoles.includes('aluno') && (
                  <DropdownMenuItem onClick={() => handleRoleChange('aluno')}>
                    <User className="w-4 h-4 mr-2" />
                    Aluno
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {currentUser?.name.charAt(0)}
                </div>
                <span className="hidden md:block">{currentUser?.name}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/perfil')}>
                <User className="w-4 h-4 mr-2" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};