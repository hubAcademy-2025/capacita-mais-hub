export type UserRole = 'admin' | 'professor' | 'aluno';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Trail {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  duration: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
}

export interface Module {
  id: string;
  title: string;
  description: string;
  content: Content[];
  order: number;
}

export interface Content {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'quiz' | 'live';
  url?: string;
  duration?: string;
  description?: string;
}

export interface Class {
  id: string;
  name: string;
  professorId: string;
  trailId: string;
  studentIds: string[];
  createdAt: string;
  status: 'active' | 'completed' | 'paused';
}

export interface Enrollment {
  studentId: string;
  classId: string;
  progress: number;
  finalGrade?: number;
  completedContent: string[];
  enrolledAt: string;
}

export interface Meeting {
  id: string;
  classId: string;
  title: string;
  dateTime: string;
  duration: number;
  description?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}