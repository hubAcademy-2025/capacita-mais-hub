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
      console.log('Fetching users...');
      
      // Get all profiles with their roles using a proper join
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          avatar_url,
          created_at
        `);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles fetched:', profiles?.length || 0, profiles);

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        throw rolesError;
      }

      console.log('User roles fetched:', userRoles?.length || 0, userRoles);

      // Transform the data to include roles as array
      const usersWithRoles = profiles?.map(profile => {
        const roles = userRoles?.filter(ur => ur.user_id === profile.id)?.map(ur => ur.role) || [];
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          roles
        };
      }) || [];

      console.log('Users with roles processed:', usersWithRoles.length, usersWithRoles);
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
    const filteredUsers = users.filter(user => user.roles.includes(role));
    console.log(`Users with role '${role}':`, filteredUsers.length, filteredUsers);
    return filteredUsers;
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