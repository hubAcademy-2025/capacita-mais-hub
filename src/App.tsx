import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { AuthPage } from "@/pages/AuthPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminTurmasPage } from "@/pages/admin/AdminTurmasPage";
import { AdminTrilhasPage } from "./pages/admin/AdminTrilhasPage";
import { AdminUsuariosPage } from "./pages/admin/AdminUsuariosPage";
import { AdminRelatoriosPage } from "./pages/admin/AdminRelatoriosPage";
import { AdminClassDetailPage } from "./pages/admin/AdminClassDetailPage";
import { AdminMeetingRoomPage } from "@/pages/admin/AdminMeetingRoomPage";
import { AdminAttendanceReportsPage } from "@/pages/admin/AdminAttendanceReportsPage";
import { ProfessorDashboard } from "@/pages/professor/ProfessorDashboard";
import { ProfessorTurmasPage } from "@/pages/professor/ProfessorTurmasPage";
import { ProfessorEncontrosPage } from "@/pages/professor/ProfessorEncontrosPage";
import { ProfessorMeetingRoomPage } from "@/pages/professor/ProfessorMeetingRoomPage";
import { ProfessorAnalyticsPage } from "@/pages/professor/ProfessorAnalyticsPage";
import { ProfessorAttendanceReportsPage } from "@/pages/professor/ProfessorAttendanceReportsPage";
import { AlunoDashboard } from "@/pages/aluno/AlunoDashboard";
import { ClassroomPage } from "@/pages/aluno/ClassroomPage";
import { AlunoTrilhaPage } from "@/pages/aluno/AlunoTrilhaPage";
import { AlunoEncontrosPage } from "@/pages/aluno/AlunoEncontrosPage";
import { AlunoMeetingRoomPage } from "@/pages/aluno/AlunoMeetingRoomPage";
import { AlunoProgressoPage } from "@/pages/aluno/AlunoProgressoPage";
import { AlunoContentViewerPage } from "@/pages/aluno/AlunoContentViewerPage";
import { ProfessorClassPage } from "@/pages/professor/ProfessorClassPage";
import { ProfessorContentViewerPage } from "@/pages/professor/ProfessorContentViewerPage";
import { ConfiguracoesPage } from "@/pages/ConfiguracoesPage";
import { PerfilPage } from "@/pages/PerfilPage";
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
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/" element={<DashboardRedirect />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <Layout title="Dashboard Administrativo" />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="turmas" element={<AdminTurmasPage />} />
              <Route path="turmas/:classId" element={<AdminClassDetailPage />} />
              <Route path="trilhas" element={<AdminTrilhasPage />} />
              <Route path="usuarios" element={<AdminUsuariosPage />} />
              <Route path="relatorios" element={<AdminRelatoriosPage />} />
              <Route path="encontros/relatorios" element={<AdminAttendanceReportsPage />} />
              <Route path="encontro/:meetingId" element={<AdminMeetingRoomPage />} />
            </Route>
            
            {/* Protected Professor Routes */}
            <Route path="/professor" element={
              <ProtectedRoute>
                <Layout title="Dashboard do Professor" />
              </ProtectedRoute>
            }>
              <Route index element={<ProfessorDashboard />} />
              <Route path="turmas" element={<ProfessorTurmasPage />} />
              <Route path="turma/:classId" element={<ProfessorClassPage />} />
              <Route path="encontros" element={<ProfessorEncontrosPage />} />
              <Route path="encontros/relatorios" element={<ProfessorAttendanceReportsPage />} />
              <Route path="encontro/:meetingId" element={<ProfessorMeetingRoomPage />} />
              <Route path="analytics" element={<ProfessorAnalyticsPage />} />
              <Route path="content/:trailId/:moduleId/:contentId" element={<ProfessorContentViewerPage />} />
            </Route>
            
            {/* Protected Aluno Routes */}
            <Route path="/aluno" element={
              <ProtectedRoute>
                <Layout title="Meu Aprendizado" />
              </ProtectedRoute>
            }>
              <Route index element={<AlunoDashboard />} />
              <Route path="turma/:classId" element={<ClassroomPage />} />
              <Route path="trilha" element={<AlunoTrilhaPage />} />
              <Route path="encontros" element={<AlunoEncontrosPage />} />
              <Route path="encontro/:meetingId" element={<AlunoMeetingRoomPage />} />
              <Route path="progresso" element={<AlunoProgressoPage />} />
            </Route>
            
            {/* Protected Student Content Viewer */}
            <Route path="/aluno/turma/:classId/trilha/:trailId/modulo/:moduleId/conteudo/:contentId" element={
              <ProtectedRoute>
                <AlunoContentViewerPage />
              </ProtectedRoute>
            } />
            
            {/* Protected Global Routes */}
            <Route path="/configuracoes" element={
              <ProtectedRoute>
                <Layout title="Configurações" />
              </ProtectedRoute>
            }>
              <Route index element={<ConfiguracoesPage />} />
            </Route>
            <Route path="/perfil" element={
              <ProtectedRoute>
                <Layout title="Perfil" />
              </ProtectedRoute>
            }>
              <Route index element={<PerfilPage />} />
            </Route>
          
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;