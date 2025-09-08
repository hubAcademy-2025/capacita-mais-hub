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
  certificateConfig: {
    enabled: boolean;
    type: 'trail' | 'module' | 'both';
  };
  isBlocked?: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  content: Content[];
  order: number;
  isBlocked?: boolean;
}

export interface Content {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'quiz' | 'live';
  url?: string;
  duration?: string;
  description?: string;
  isBlocked?: boolean;
  order: number;
  quiz?: Quiz;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  allowRetakes: boolean;
  showCorrectAnswers: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'single-choice' | 'true-false' | 'number' | 'text';
  options?: string[]; // for multiple/single choice
  correctAnswer: string | string[] | number; // depends on type
  explanation?: string;
  points: number;
}

export interface Certificate {
  id: string;
  userId: string;
  trailId?: string;
  moduleId?: string;
  issuedAt: string;
  qrCode: string;
  type: 'trail' | 'module';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
}

export interface UserProgress {
  userId: string;
  contentId: string;
  completed: boolean;
  percentage: number;
  lastAccessed: string;
}

export interface CommunityPost {
  id: string;
  classId: string;
  authorId: string;
  content: string;
  createdAt: string;
  parentId?: string; // for replies
  likes: string[]; // user IDs who liked
}

export interface UserPoints {
  userId: string;
  totalPoints: number;
  badges: string[]; // badge IDs
  achievements: string[];
}

export interface Class {
  id: string;
  name: string;
  professorIds: string[];
  trailIds: string[];
  studentIds: string[];
  createdAt: string;
  status: 'active' | 'completed' | 'paused';
  // Backward compatibility
  professorId?: string;
  trailId?: string;
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
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  meetingUrl?: string;
  hostUserId: string;
  maxParticipants?: number;
  attendanceList: MeetingAttendance[];
  participantTypes: ('students' | 'professors')[];
}

export interface MeetingAttendance {
  meetingId: string;
  userId: string;
  checkInTime: string;
  checkOutTime?: string;
  duration?: number; // in minutes
  status: 'present' | 'absent' | 'late';
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