import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppStore } from '@/store/useAppStore';

interface LayoutProps {
  title: string;
}

export const Layout = ({ title }: LayoutProps) => {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title={title} />
        
        <main className={`flex-1 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        } overflow-x-auto`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};