import { useState, useCallback } from 'react';
import { ProfileService } from '@/services/ProfileService';
import { User, UserProfileUpdate, ChangePasswordRequest } from '@shared/contracts';
import { useAuth } from '@/features/auth/AuthProvider';

export function useProfile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(async (data: UserProfileUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await ProfileService.updateProfile(data);
      setUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao atualizar perfil';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ProfileService.changePassword(data);
      return response;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao alterar senha';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user: user as User,
    loading,
    error,
    updateProfile,
    changePassword,
  };
}
