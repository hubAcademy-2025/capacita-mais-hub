import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { ProfessorDashboard } from "@/pages/professor/ProfessorDashboard";
import { AlunoDashboard } from "@/pages/aluno/AlunoDashboard";
import { ClassroomPage } from "@/pages/aluno/ClassroomPage";
import { useAppStore } from "@/store/useAppStore";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const DashboardRedirect = () => {
  const { currentRole } = useAppStore();
  
  switch (currentRole) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'professor':
      return <Navigate to="/professor" replace />;
    case 'aluno':
      return <Navigate to="/aluno" replace />;
    default:
      return <Navigate to="/admin" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardRedirect />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Layout title="Dashboard Administrativo" />}>
            <Route index element={<AdminDashboard />} />
          </Route>
          
          {/* Professor Routes */}
          <Route path="/professor" element={<Layout title="Dashboard do Professor" />}>
            <Route index element={<ProfessorDashboard />} />
          </Route>
          
          {/* Aluno Routes */}
          <Route path="/aluno" element={<Layout title="Meu Aprendizado" />}>
            <Route index element={<AlunoDashboard />} />
            <Route path="turma/:classId" element={<ClassroomPage />} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
