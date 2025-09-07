import { create } from 'zustand';
import { User, UserRole, Class, Trail, Enrollment, Meeting } from '@/types';
import { users, classes, trails, enrollments, meetings } from '@/data/mockData';

interface AppState {
  // User management
  currentUser: User | null;
  currentRole: UserRole;
  users: User[];
  
  // Data
  classes: Class[];
  trails: Trail[];
  enrollments: Enrollment[];
  meetings: Meeting[];
  
  // UI State
  sidebarCollapsed: boolean;
  
  // Actions
  setCurrentUser: (user: User) => void;
  setCurrentRole: (role: UserRole) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Data management
  addClass: (newClass: Class) => void;
  updateClass: (classId: string, updates: Partial<Class>) => void;
  deleteClass: (classId: string) => void;
  
  addMeeting: (meeting: Meeting) => void;
  updateEnrollment: (studentId: string, classId: string, updates: Partial<Enrollment>) => void;
  
  // Computed values
  getClassesByProfessor: (professorId: string) => Class[];
  getStudentEnrollment: (studentId: string) => Enrollment | null;
  getClassMeetings: (classId: string) => Meeting[];
  getTrailById: (trailId: string) => Trail | null;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentUser: users[0], // Default to admin for demo
  currentRole: 'admin',
  users,
  classes,
  trails,
  enrollments,
  meetings,
  sidebarCollapsed: false,
  
  // Actions
  setCurrentUser: (user) => set({ currentUser: user, currentRole: user.role }),
  setCurrentRole: (role) => set({ currentRole: role }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  // Data management
  addClass: (newClass) => set((state) => ({ 
    classes: [...state.classes, newClass] 
  })),
  
  updateClass: (classId, updates) => set((state) => ({
    classes: state.classes.map(c => 
      c.id === classId ? { ...c, ...updates } : c
    )
  })),
  
  deleteClass: (classId) => set((state) => ({
    classes: state.classes.filter(c => c.id !== classId)
  })),
  
  addMeeting: (meeting) => set((state) => ({
    meetings: [...state.meetings, meeting]
  })),
  
  updateEnrollment: (studentId, classId, updates) => set((state) => ({
    enrollments: state.enrollments.map(e => 
      e.studentId === studentId && e.classId === classId 
        ? { ...e, ...updates } 
        : e
    )
  })),
  
  // Computed values
  getClassesByProfessor: (professorId) => {
    return get().classes.filter(c => c.professorId === professorId);
  },
  
  getStudentEnrollment: (studentId) => {
    return get().enrollments.find(e => e.studentId === studentId) || null;
  },
  
  getClassMeetings: (classId) => {
    return get().meetings.filter(m => m.classId === classId);
  },
  
  getTrailById: (trailId) => {
    return get().trails.find(t => t.id === trailId) || null;
  },
}));