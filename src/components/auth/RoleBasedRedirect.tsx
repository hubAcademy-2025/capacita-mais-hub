import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

export const RoleBasedRedirect: React.FC = () => {
  const { currentUser } = useAppStore();

  console.log('=== ROLE REDIRECT DEBUG ===');
  console.log('Current user:', currentUser);

  if (!currentUser) {
    console.log('No current user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Redirect based on user role
  console.log('Redirecting based on role:', currentUser.role);
  switch (currentUser.role) {
    case 'admin':
      console.log('Redirecting to /admin');
      return <Navigate to="/admin" replace />;
    case 'professor':
      console.log('Redirecting to /professor');
      return <Navigate to="/professor" replace />;
    case 'aluno':
      console.log('Redirecting to /aluno');
      return <Navigate to="/aluno" replace />;
    default:
      console.log('Unknown role, defaulting to /aluno');
      return <Navigate to="/aluno" replace />;
  }
};