import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';

// Import pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminTurmasPage } from '@/pages/admin/AdminTurmasPage';
import { AdminUsuariosPage } from '@/pages/admin/AdminUsuariosPage';
import { AdminTrilhasPage } from '@/pages/admin/AdminTrilhasPage';
import { AdminRelatoriosPage } from '@/pages/admin/AdminRelatoriosPage';
import { AdminClassDetailPage } from '@/pages/admin/AdminClassDetailPage';
import { AdminAttendanceReportsPage } from '@/pages/admin/AdminAttendanceReportsPage';
import { AdminMeetingRoomPage } from '@/pages/admin/AdminMeetingRoomPage';

import { ProfessorDashboard } from '@/pages/professor/ProfessorDashboard';
import { ProfessorTurmasPage } from '@/pages/professor/ProfessorTurmasPage';
import { ProfessorEncontrosPage } from '@/pages/professor/ProfessorEncontrosPage';
import { ProfessorAnalyticsPage } from '@/pages/professor/ProfessorAnalyticsPage';
import { ProfessorClassPage } from '@/pages/professor/ProfessorClassPage';
import { ProfessorContentViewerPage } from '@/pages/professor/ProfessorContentViewerPage';
import { ProfessorAttendanceReportsPage } from '@/pages/professor/ProfessorAttendanceReportsPage';
import { ProfessorMeetingRoomPage } from '@/pages/professor/ProfessorMeetingRoomPage';

import { AlunoDashboard } from '@/pages/aluno/AlunoDashboard';
import { AlunoTrilhaPage } from '@/pages/aluno/AlunoTrilhaPage';
import { AlunoProgressoPage } from '@/pages/aluno/AlunoProgressoPage';
import { AlunoEncontrosPage } from '@/pages/aluno/AlunoEncontrosPage';
import { ClassroomPage } from '@/pages/aluno/ClassroomPage';
import { AlunoContentViewerPage } from '@/pages/aluno/AlunoContentViewerPage';
import { AlunoMeetingRoomPage } from '@/pages/aluno/AlunoMeetingRoomPage';

import { PerfilPage } from '@/pages/PerfilPage';
import { ConfiguracoesPage } from '@/pages/ConfiguracoesPage';
import { AuthPage } from '@/pages/AuthPage';
import NotFound from '@/pages/NotFound';

import { Toaster } from '@/components/ui/toaster';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/turmas" element={
            <ProtectedRoute>
              <Layout>
                <AdminTurmasPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/usuarios" element={
            <ProtectedRoute>
              <Layout>
                <AdminUsuariosPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/trilhas" element={
            <ProtectedRoute>
              <Layout>
                <AdminTrilhasPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/relatorios" element={
            <ProtectedRoute>
              <Layout>
                <AdminRelatoriosPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/turmas/:classId" element={
            <ProtectedRoute>
              <Layout>
                <AdminClassDetailPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/relatorios/frequencia" element={
            <ProtectedRoute>
              <Layout>
                <AdminAttendanceReportsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/meeting/:meetingId" element={
            <ProtectedRoute>
              <Layout>
                <AdminMeetingRoomPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/professor" element={
            <ProtectedRoute>
              <Layout>
                <ProfessorDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/professor/turmas" element={
            <ProtectedRoute>
              <Layout>
                <ProfessorTurmasPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/professor/turmas/:classId" element={
            <ProtectedRoute>
              <Layout>
                <ProfessorClassPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/professor/encontros" element={
            <ProtectedRoute>
              <Layout>
                <ProfessorEncontrosPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/professor/analytics" element={
            <ProtectedRoute>
              <Layout>
                <ProfessorAnalyticsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/professor/content/:contentId" element={
            <ProtectedRoute>
              <Layout>
                <ProfessorContentViewerPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/professor/relatorios/frequencia" element={
            <ProtectedRoute>
              <Layout>
                <ProfessorAttendanceReportsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/professor/meeting/:meetingId" element={
            <ProtectedRoute>
              <Layout>
                <ProfessorMeetingRoomPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/aluno" element={
            <ProtectedRoute>
              <Layout>
                <AlunoDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/aluno/trilha/:trailId" element={
            <ProtectedRoute>
              <Layout>
                <AlunoTrilhaPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/aluno/progresso" element={
            <ProtectedRoute>
              <Layout>
                <AlunoProgressoPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/aluno/encontros" element={
            <ProtectedRoute>
              <Layout>
                <AlunoEncontrosPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/aluno/turma/:classId" element={
            <ProtectedRoute>
              <Layout>
                <ClassroomPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/aluno/content/:contentId" element={
            <ProtectedRoute>
              <Layout>
                <AlunoContentViewerPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/aluno/meeting/:meetingId" element={
            <ProtectedRoute>
              <Layout>
                <AlunoMeetingRoomPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/perfil" element={
            <ProtectedRoute>
              <Layout>
                <PerfilPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/configuracoes" element={
            <ProtectedRoute>
              <Layout>
                <ConfiguracoesPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
};

export default App;