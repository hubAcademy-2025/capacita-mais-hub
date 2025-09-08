import { create } from 'zustand';
import { User, UserRole, Class, Trail, Enrollment, Meeting, Notification, Badge, UserProgress, CommunityPost, UserPoints } from '@/types';
import { users, classes, trails, enrollments, meetings, notifications, badges, userProgress, communityPosts, userPoints } from '@/data/mockData';

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
  notifications: Notification[];
  badges: Badge[];
  userProgress: UserProgress[];
  communityPosts: CommunityPost[];
  userPoints: UserPoints[];
  
  // UI State
  sidebarCollapsed: boolean;
  
  // Actions
  setCurrentUser: (user: User) => void;
  setCurrentRole: (role: UserRole) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // User management
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  
  // Data management
  addClass: (newClass: Class) => void;
  updateClass: (classId: string, updates: Partial<Class>) => void;
  deleteClass: (classId: string) => void;
  
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (meetingId: string, updates: Partial<Meeting>) => void;
  updateEnrollment: (studentId: string, classId: string, updates: Partial<Enrollment>) => void;
  
  // Notifications
  markNotificationsAsRead: (userId: string) => void;
  addNotification: (notification: Notification) => void;
  
  // Community
  addCommunityPost: (post: CommunityPost) => void;
  togglePostLike: (postId: string, userId: string) => void;
  
  // Progress
  updateUserProgress: (userId: string, contentId: string, progress: Partial<UserProgress>) => void;
  
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
  notifications,
  badges,
  userProgress,
  communityPosts,
  userPoints,
  sidebarCollapsed: false,
  
  // Actions
  setCurrentUser: (user) => set({ currentUser: user, currentRole: user.role }),
  setCurrentRole: (role) => set({ currentRole: role }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  // User management
  addUser: (user) => set((state) => ({
    users: [...state.users, user]
  })),
  
  updateUser: (user) => set((state) => ({
    users: state.users.map(u => u.id === user.id ? user : u)
  })),
  
  deleteUser: (userId) => set((state) => ({
    users: state.users.filter(u => u.id !== userId)
  })),
  
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
  
  updateMeeting: (meetingId, updates) => set((state) => ({
    meetings: state.meetings.map(m => 
      m.id === meetingId ? { ...m, ...updates } : m
    )
  })),
  
  updateEnrollment: (studentId, classId, updates) => set((state) => ({
    enrollments: state.enrollments.map(e => 
      e.studentId === studentId && e.classId === classId 
        ? { ...e, ...updates } 
        : e
    )
  })),
  
  // Notifications
  markNotificationsAsRead: (userId) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.userId === userId ? { ...n, isRead: true } : n
    )
  })),
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),
  
  // Community
  addCommunityPost: (post) => set((state) => ({
    communityPosts: [post, ...state.communityPosts]
  })),

  togglePostLike: (postId, userId) => set((state) => ({
    communityPosts: state.communityPosts.map(post => 
      post.id === postId 
        ? {
            ...post,
            likes: post.likes.includes(userId)
              ? post.likes.filter(id => id !== userId)
              : [...post.likes, userId]
          }
        : post
    )
  })),
  
  // Progress
  updateUserProgress: (userId, contentId, progress) => set((state) => ({
    userProgress: state.userProgress.map(p => 
      p.userId === userId && p.contentId === contentId 
        ? { ...p, ...progress }
        : p
    )
  })),
  
  // Computed values
  getClassesByProfessor: (professorId) => {
    return get().classes.filter(c => 
      (c.professorIds && c.professorIds.includes(professorId)) || 
      // @ts-ignore - backward compatibility
      c.professorId === professorId
    );
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