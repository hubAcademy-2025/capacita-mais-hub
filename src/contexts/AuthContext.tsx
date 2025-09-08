import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { setCurrentUser } = useAppStore();

  // Function to fetch user profile and roles from database
  const fetchUserProfile = async (userId: string) => {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      if (!profile) {
        console.warn('No profile found for user:', userId);
        // Create a basic profile if it doesn't exist
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const userName = user.email?.split('@')[0] || 'Usuário';
          
          // Try to create profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              name: userName,
              email: user.email || ''
            });

          if (!insertError) {
            // Also create default role
            await supabase
              .from('user_roles')
              .insert({
                user_id: userId,
                role: 'aluno'
              });

            return {
              id: userId,
              name: userName,
              email: user.email || '',
              role: 'aluno' as const,
              avatar: ''
            };
          }
        }
        return null;
      }

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        return null;
      }

      const roles = userRoles?.map(r => r.role) || [];
      const primaryRole = roles[0] || 'aluno';

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: primaryRole as 'admin' | 'professor' | 'aluno',
        avatar: profile.avatar_url || ''
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Update app store with current user from database
        if (session?.user) {
          // Use setTimeout to avoid potential issues with async calls in auth callback
          setTimeout(async () => {
            const userProfile = await fetchUserProfile(session.user.id);
            if (userProfile) {
              setCurrentUser(userProfile);
            }
          }, 0);
        } else {
          setCurrentUser(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id);
        if (userProfile) {
          setCurrentUser(userProfile);
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setCurrentUser]);

  const signOut = async () => {
    console.log('AuthContext: Starting signOut process');
    await supabase.auth.signOut();
    setCurrentUser(null);
    console.log('AuthContext: SignOut completed');
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};