import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  UserCheck,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';

const adminNavItems = [
  { icon: Home, label: 'Dashboard', path: '/admin' },
  { icon: Building, label: 'Turmas', path: '/admin/turmas' },
  { icon: BookOpen, label: 'Trilhas', path: '/admin/trilhas' },
  { icon: Users, label: 'Usuários', path: '/admin/usuarios' },
  { icon: BarChart3, label: 'Relatórios', path: '/admin/relatorios' },
];

const professorNavItems = [
  { icon: Home, label: 'Dashboard', path: '/professor' },
  { icon: Users, label: 'Minhas Turmas', path: '/professor/turmas' },
  { icon: Calendar, label: 'Encontros', path: '/professor/encontros' },
  { icon: BarChart3, label: 'Analytics', path: '/professor/analytics' },
];

const alunoNavItems = [
  { icon: Home, label: 'Dashboard', path: '/aluno' },
  { icon: BookOpen, label: 'Minha Trilha', path: '/aluno/trilha' },
  { icon: Calendar, label: 'Encontros', path: '/aluno/encontros' },
  { icon: GraduationCap, label: 'Progresso', path: '/aluno/progresso' },
];

export const Sidebar = () => {
  const { currentRole, sidebarCollapsed, toggleSidebar } = useAppStore();
  
  const getNavItems = () => {
    switch (currentRole) {
      case 'admin':
        return adminNavItems;
      case 'professor':
        return professorNavItems;
      case 'aluno':
        return alunoNavItems;
      default:
        return adminNavItems;
    }
  };

  const navItems = getNavItems();

  return (
    <aside className={cn(
      "bg-card border-r border-border transition-all duration-300 ease-in-out fixed left-0 top-0 h-screen flex flex-col z-40",
      sidebarCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">Capacita+</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="ml-auto hover:bg-secondary"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                    "hover:bg-secondary hover:text-secondary-foreground",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground",
                    sidebarCollapsed && "justify-center px-2"
                  )
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
              "hover:bg-secondary hover:text-secondary-foreground",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground",
              sidebarCollapsed && "justify-center px-2"
            )
          }
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span>Configurações</span>}
        </NavLink>
      </div>
    </aside>
  );
};