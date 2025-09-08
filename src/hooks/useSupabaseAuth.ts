import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  roles: string[];
}

export const useSupabaseAuth = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { setCurrentUser, users } = useAppStore();

  useEffect(() => {
    const fetchUserProfile = async (userId: string) => {
      try {
        // Get user profile - now only returns own profile due to RLS
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
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

        console.log('=== USER PROFILE DEBUG ===');
        console.log('Profile data:', profile);
        console.log('User roles data:', userRoles);
        console.log('Extracted roles:', roles);

        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatar_url: profile.avatar_url,
          roles
        };
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
        return null;
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
          
          // Set the current user based on their primary role (first role or 'aluno' as default)
          if (profile) {
            const primaryRole = profile.roles[0] || 'aluno';
            const mockUser = users.find(u => u.role === primaryRole) || users.find(u => u.role === 'aluno');
            if (mockUser) {
              setCurrentUser({
                ...mockUser,
                id: profile.id,
                name: profile.name,
                email: profile.email,
                role: primaryRole as any
              });
            }
          }
        } else {
          setUserProfile(null);
          setCurrentUser(null);
        }
        setLoading(false);
      }
    );

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          setUserProfile(profile);
          
          if (profile) {
            const primaryRole = profile.roles[0] || 'aluno';
            const mockUser = users.find(u => u.role === primaryRole) || users.find(u => u.role === 'aluno');
            if (mockUser) {
              setCurrentUser({
                ...mockUser,
                id: profile.id,
                name: profile.name,
                email: profile.email,
                role: primaryRole as any
              });
            }
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setCurrentUser, users]);

  const switchRole = (newRole: string) => {
    if (userProfile && userProfile.roles.includes(newRole)) {
      const mockUser = users.find(u => u.role === newRole);
      if (mockUser) {
        setCurrentUser({
          ...mockUser,
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          role: newRole as any
        });
      }
    }
  };

  return {
    userProfile,
    loading,
    switchRole
  };
};