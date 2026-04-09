import { api } from './api.client';
import { User, UserProfileUpdate, ChangePasswordRequest } from '@shared/contracts';

export class ProfileService {
  /** Busca dados completos do perfil do usuário logado */
  static async getProfile(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  }

  /** Atualiza dados básicos do perfil */
  static async updateProfile(data: UserProfileUpdate): Promise<User> {
    const response = await api.patch('/users/profile', data);
    return response.data;
  }

  /** Altera a senha do usuário logado */
  static async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await api.post('/users/change-password', data);
    return response.data;
  }

  /** Busca configurações da conta/tenant */
  static async getAccountSettings(): Promise<any> {
    const response = await api.get('/tenants/settings');
    return response.data;
  }
}
