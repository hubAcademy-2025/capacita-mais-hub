import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

export const RoleBasedRedirect: React.FC = () => {
  const { currentUser } = useAppStore();

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect based on user role
  switch (currentUser.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'professor':
      return <Navigate to="/professor" replace />;
    case 'aluno':
      return <Navigate to="/aluno" replace />;
    default:
      return <Navigate to="/aluno" replace />;
  }
};