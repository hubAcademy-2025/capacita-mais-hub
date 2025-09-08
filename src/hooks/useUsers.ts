import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserWithRoles {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  roles: string[];
}

export const useUsers = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          avatar_url,
          created_at,
          user_roles!inner(role)
        `);

      if (profilesError) {
        throw profilesError;
      }

      // Transform the data to include roles as array
      const usersWithRoles = profiles?.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        roles: (profile.user_roles as any[])?.map(ur => ur.role) || []
      })) || [];

      setUsers(usersWithRoles);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getUsersByRole = (role: string) => {
    return users.filter(user => user.roles.includes(role));
  };

  const getUserStats = () => {
    const admins = getUsersByRole('admin').length;
    const professors = getUsersByRole('professor').length;
    const students = getUsersByRole('aluno').length;
    
    return { admins, professors, students, total: users.length };
  };

  return {
    users,
    loading,
    error,
    getUsersByRole,
    getUserStats,
    refetch: fetchUsers
  };
};